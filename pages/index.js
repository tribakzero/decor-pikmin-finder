import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {useRouter} from "next/router";
import {useQuery} from "react-query";

export default function Home() {
  const router = useRouter();
  const {latlong} = router.query;

  const getIdsForNominatim = (items) => items.map(item => item.type.substr(0,1).toUpperCase() + item.id).toString(',');
  const listLocationsByClassType = (locations, locationClass, locationType) => locations.filter(location => location.tags[locationClass] === locationType);

  const oql = `
          [out:json][timeout:25];
          nwr(around:8000,${latlong})->.all;
  
          nwr.all(if: t["name"])["amenity"="restaurant"]; out body geom center 2;
          nwr.all(if: t["name"])["amenity"="cafe"]; out body geom center 2;
          nwr.all(if: t["name"])["shop"="confectionery"]; out body geom center 2;
          nwr.all(if: t["name"])["amenity"="cinema"]; out body geom center 2;
          nwr.all(if: t["name"])["amenity"="pharmacy"]; out body geom center 2;
          nwr.all(if: t["name"])["tourism"="zoo"]; out body geom center 2;
          nwr.all(if: t["name"])["landuse"="forest"]; out body geom center 2;
          nwr.all(if: t["name"])["natural"="water"]; out body geom center 2;
          nwr.all(if: t["name"])["amenity"="post_office"]; out body geom center 2;
          nwr.all(if: t["name"])["tourism"="gallery"]; out body geom center 2;
          nwr.all(if: t["name"])["aeroway"="aerodrome"]; out body geom center 2;
          nwr.all(if: t["name"])["public_transport"="station"]; out body geom center 2;
          nwr.all(if: t["name"])["natural"="beach"]; out body geom center 2;
          nwr.all(if: t["name"])["amenity"="fast_food"]; out body geom center 2;
          nwr.all(if: t["name"])["shop"="convenience"]; out body geom center 2;
          nwr.all(if: t["name"])["shop"="supermarket"]; out body geom center 2;
          nwr.all(if: t["name"])["shop"="bakery"]; out body geom center 2;
          nwr.all(if: t["name"])["shop"="hairdresser"]; out body geom center 2;
          nwr.all(if: t["name"])["shop"="clothes"]; out body geom center 2;
          nwr.all(if: t["name"])["leisure"="park"]; out body geom center 2;
        `;
  const getOverpass = async ({ queryKey }) => {
    const [_, overpassPayload] = queryKey
    const response = await fetch(`//overpass-api.de/api/interpreter?data=${overpassPayload}`)
    const data = await response.json()
    return data
  }

  const getNominatim = async ({ queryKey }) => {
    const [_, nominatimPayload] = queryKey
    const response = await fetch(`//nominatim.openstreetmap.org/lookup?format=json&osm_ids=${getIdsForNominatim(nominatimPayload)}`)
    const data = await response.json()
    return data
  }

  const { data:overpassData } = useQuery(
    ['overpass', oql],
    getOverpass,
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(latlong),
      initialData: { elements: [] }
    }
  )
  const { data:nominatimData } = useQuery(
    ['nominatim', overpassData.elements],
    getNominatim,
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(overpassData.elements.length > 0),
      initialData: []
    })

  const locationTypes = [
    ['amenity','restaurant'],
    ['amenity','cafe'],
    ['shop','confectionery'],
    ['amenity','cinema'],
    ['amenity','pharmacy'],
    ['tourism','zoo'],
    ['landuse','forest'],
    ['natural','water'],
    ['amenity','post_office'],
    ['tourism','gallery'],
    ['aeroway','aerodrome'],
    ['public_transport','station'],
    ['natural','beach'],
    ['amenity','fast_food'],
    ['shop','convenience'],
    ['shop','supermarket'],
    ['shop','bakery'],
    ['shop','hairdresser'],
    ['shop','clothes'],
    ['leisure','park']
  ];

  const findNominatinItemByOsmId = osmId => nominatimData.find(item => item.osm_id === osmId)

  return (
    <div className={styles.container}>
      <Head>
        <title>Decor Pikmin Finder</title>
        <meta name="description" content="Find the Decor Pikmin you're missing" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Decor Pikmin Finder!
        </h1>

        {!latlong && (
          <p className={styles.description}>
            Input your lat/long into the url like this{' '}
            <code className={styles.code}>/?latlong=34.96970,135.75649</code>
          </p>
        )}

        {nominatimData && nominatimData.length > 0 && (
          <div>
            <h3>Near locations you may like to Lifelog.</h3>
            <ul>
              {locationTypes.map(([locationClass, locationType]) => listLocationsByClassType(overpassData.elements, locationClass, locationType).length > 0 && (
                <li key={locationType}>{locationType}
                  <ul>
                    {listLocationsByClassType(overpassData.elements, locationClass, locationType).map(item => (<li key={item.id}>{findNominatinItemByOsmId(item.id).display_name}</li>))}
                  </ul>
                </li>
              ))}
              <li>Roadside... just kidding :P</li>
            </ul>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        With love by tribak.
      </footer>
    </div>
  )
}
