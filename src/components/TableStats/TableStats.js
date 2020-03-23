import React, { useState, useEffect } from 'react'
import useStats from '../../utils/useStats'
import useCountries from '../../utils/useCountries'
import Spinner from '../Spinner/Spinner'

const TableStat = ({ url, country, statsY }) => {
	const { stats, loading, error } = useStats(url)
	if (loading) return <Spinner />
	if (error) return <div>Error..</div>

	const { confirmed, deaths, recovered, lastUpdate } = stats
	const date = new Date(lastUpdate)

	const reducer = (accumulator, currentValue) => accumulator + currentValue;

	const yConfirmed = statsY ? statsY.confirmed : null
	const yConfirmedTotal = yConfirmed !== null ? yConfirmed.reduce(reducer) : 'N/a'
	const confirmed24 = confirmed && Number.isInteger(yConfirmedTotal) ? (confirmed.value - yConfirmedTotal) : 'N/a'

	const yDeaths = statsY ? statsY.deaths : null
	const yDeathsTotal = yDeaths !== null ? yDeaths.reduce(reducer) : 'N/a'
	const deaths24 = deaths && Number.isInteger(yDeathsTotal) ? (deaths.value - yDeathsTotal) : 'N/a'

	const yRecovered = statsY ? statsY.recovered : null
	const yRecoveredTotal = yRecovered !== null ? yRecovered.reduce(reducer) : 'N/a'
	const recovered24 = recovered && Number.isInteger(yRecoveredTotal) ? (recovered.value - yRecoveredTotal) : 'N/a'

	country = country === 'US' ? 'United States of America' : country

	return(
		<div className="grid grid-cols-8 gap-2 items-center bg-gray-200 hover:bg-gray-400 py-4 px-6 border-b border-l border-r border-gray-400" data-country={country}>
			<div><h2 className="text-base md:text-lg font-bold break-words md:break-normal">{country}</h2></div>
			<div>{confirmed ? confirmed.value : 'N/a'}</div>
			<div>{confirmed24}</div>
			<div>{deaths ? deaths.value : 'N/a'}</div>
			<div>{deaths24}</div>
			<div>{recovered ? recovered.value : 'N/a'}</div>
			<div>{recovered24}</div>
			<div className="text-xs">{lastUpdate ? date.toLocaleString() : 'N/a'}</div>
		</div>
	)
}

const TableStats = () => {
	const { countries, loading, error } = useCountries()
	const [ statsY, setStatsY ] = useState([])

	const today = new Date()
	const yesterday = new Date(today)
	yesterday.setDate(yesterday.getDate() - 1)
	const dd = date => String(date.getDate()).padStart(2, '0');
	const mm = date => String(date.getMonth() + 1).padStart(2, '0');
	const yyyy = date => date.getFullYear();
	const formattedDateYesterday = `${mm(yesterday)}-${dd(yesterday)}-${yyyy(yesterday)}`
	console.log(formattedDateYesterday)
	const { stats } = useStats(`https://covid19.mathdro.id/api/daily/${formattedDateYesterday}`)

	useEffect(() => {
		if(stats) {
			const output = []
			stats.forEach( async item => {
				const existing = output.filter( ( v, i ) => v.countryRegion === item.countryRegion )
				if(existing.length) {
					const existingIndex = output.indexOf(existing[0])
					output[existingIndex].confirmed = output[existingIndex].confirmed.concat(parseInt(item.confirmed))
					output[existingIndex].deaths = output[existingIndex].deaths.concat(parseInt(item.deaths))
					output[existingIndex].recovered = output[existingIndex].recovered.concat(parseInt(item.recovered))
				} else {
					if(typeof item.confirmed == 'string') {
						item.confirmed = [parseInt(item.confirmed)]
					}
					if(typeof item.deaths == 'string') {
						item.deaths = [parseInt(item.deaths)]
					}
					if(typeof item.recovered == 'string') {
						item.recovered = [parseInt(item.recovered)]
					}
					output.push(item)
				}
			} )
			setStatsY(output)
		}
	}, [stats])

	const handleSearch = e => {
		const val = e.target.value.toLowerCase()
		const countryEls = document.querySelectorAll('[data-country]')

		countryEls.forEach( el => {
			const data = el.dataset.country.toLowerCase()
			if (! data.includes(val)) {
				el.classList.add('hidden')
			} else {
				if( el.classList.contains('hidden') ) {
					el.classList.remove('hidden');
				}
			}
		})

	}

	if (loading) return <Spinner />
	if (error) return <div>Error..</div>
	return (
		<div className="pb-16">
			<h1 className="text-5xl py-2">COVID-19 Stats by Country</h1>
			<input className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 mb-4 block w-full appearance-none leading-normal" type="text" placeholder="Search By Country" onChange={e => handleSearch(e)} />
			<div className="sticky top-0 grid grid-cols-8 gap-2 items-center py-4 px-6 text-xs md:text-sm bg-gray-900 text-gray-200 break-words md:break-normal">
				<div><strong>Country</strong></div>
				<div><strong>Total Confirmed</strong></div>
				<div><strong>24h Change</strong></div>
				<div><strong>Total Deaths</strong></div>
				<div><strong>24h Change</strong></div>
				<div><strong>Total Recovered</strong></div>
				<div><strong>24h Change</strong></div>
				<div><strong>Last Updated</strong></div>
			</div>
			{
				Object.keys(countries).map( key => {
					const countryStatsY = statsY.filter(obj => obj.countryRegion === key)
					return <TableStat key={key} country={key} statsY={countryStatsY[0]} url={`https://covid19.mathdro.id/api/countries/${countries[key]}`} />
				} )
			}
		</div>
	)
}

export default TableStats