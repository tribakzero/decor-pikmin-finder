import Image from 'next/image'
import {useRouter} from "next/router"
import {useQuery} from "react-query"
import loading from '../../public/loading.gif'

export default function Coords() {
  const router = useRouter();
  const {coords} = router.query;

  const getIdsForNominatim = (items) => items.map(item => item.type.substr(0,1).toUpperCase() + item.id).toString(',');
  const listLocationsByClassType = (locations, locationClass, locationType) => locations.filter(location => location.tags[locationClass] === locationType);

  const oql = `
          /*
          Currently commenting the date since query takes a crazy amount of extra time with it and returns the same data to me.
          [date:"2021-10-26T00:00:00Z"]
          */
          [out:json];
          nwr(around:8000,${coords})->.all;
  
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

  const { isFetching:isOverpassFetching, data:overpassData } = useQuery(
    ['overpass', oql],
    getOverpass,
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(coords),
      initialData: { elements: [] }
    }
  )
  const { isFetching:isNominatimFetching, data:nominatimData } = useQuery(
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
    <>

      {(isOverpassFetching || isNominatimFetching) ? (
        <div className="flex flex-col flex-grow-0 flex-shrink-0 items-center">
          <Image className="flex flex-grow-0" layout="fixed" src={loading} width={50} height={50} />
          Loading, please wait ...
        </div>
      ) :
        nominatimData && nominatimData.length > 0 && (
        <div>
          <h3 className="font-bold">Near locations you may like to Lifelog.</h3>
          <ul>
            {locationTypes.map(([locationClass, locationType]) => listLocationsByClassType(overpassData.elements, locationClass, locationType).length > 0 && (
              <li key={locationType}><strong>{locationType}</strong>
                <ul>
                  {listLocationsByClassType(overpassData.elements, locationClass, locationType).map(item => (
                    <li key={item.id}>{findNominatinItemByOsmId(item.id).display_name}</li>
                  ))}
                </ul>
              </li>
            ))}
            <li><strong>Roadside...</strong> just kidding :P</li>
          </ul>
        </div>
      )}
    </>
  )
}
