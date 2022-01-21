import Link from 'next/link'
import {useRouter} from "next/router";
import {useEffect} from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position => {
        router.push(`/search/${position.coords.latitude},${position.coords.longitude}`)
      }))
    }
  }, [])

  return (
    <p className="mx-8 my-0 leading-5 text-xl">
      Please, add your <code>lat,long</code> into the url as it follows:{' '}
      <Link href="/search/34.96970,135.75649">/search/34.96970,135.75649</Link>
    </p>
  )
}
