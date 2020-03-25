import React, { useState, useEffect, useRef, forwardRef } from 'react'
import useStats from '../../utils/useStats'
import useCountries from '../../utils/useCountries'
import Spinner from '../Spinner/Spinner'

const TableStat = forwardRef(({ url, country, statsY }, ref) => {
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

	const cVal = confirmed ? confirmed.value : 'N/a'
	const dVal = deaths ? deaths.value : 'N/a'
	const rVal = recovered ? recovered.value : 'N/a'

	return(
		<div ref={ref} className="countrystat grid grid-cols-8 gap-2 items-center bg-gray-200 hover:bg-gray-400 py-4 px-6 border-b border-l border-r border-gray-400" data-country={country} data-confirmed={cVal === 'N/a' ? 0 : cVal} data-deaths={dVal === 'N/a' ? 0 : dVal} data-recovered={rVal === 'N/a' ? 0 : rVal} data-c24={confirmed24 === 'N/a' ? 0 : confirmed24} data-d24={deaths24 === 'N/a' ? 0 : deaths24} data-r24={recovered24 === 'N/a' ? 0 : recovered24}>
			<div><h2 className="text-base md:text-lg font-bold break-words md:break-normal">{country}</h2></div>
			<div>{cVal}</div>
			<div>{confirmed24}</div>
			<div>{dVal}</div>
			<div>{deaths24}</div>
			<div>{rVal}</div>
			<div>{recovered24}</div>
			<div className="text-xs">{lastUpdate ? date.toLocaleString() : 'N/a'}</div>
		</div>
	)
})

const TableStats = () => {
	const { countries, loading, error } = useCountries()
	const [ statsY, setStatsY ] = useState([])
	const [order, setOrder] = useState({
		by: 'country',
		sort: 'default'
	})
	const tableEl = useRef(null)

	const today = new Date()
	const yesterday = new Date(today)
	yesterday.setDate(yesterday.getDate() - 1)
	const dd = date => String(date.getDate()).padStart(2, '0');
	const mm = date => String(date.getMonth() + 1).padStart(2, '0');
	const yyyy = date => date.getFullYear();
	const formattedDateYesterday = `${mm(yesterday)}-${dd(yesterday)}-${yyyy(yesterday)}`
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
					if(typeof item.confirmed === 'string') {
						item.confirmed = [parseInt(item.confirmed)]
					}
					if(typeof item.deaths === 'string') {
						item.deaths = [parseInt(item.deaths)]
					}
					if(typeof item.recovered === 'string') {
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

	const handleSort = (data, order, setOrder) => {
		const allStats = Array.from(document.querySelectorAll(`.countrystat[data-${data}]`))
		const { by, sort } = order

		if( sort === 'default' || sort === 'desc' ) {
			setOrder({
				by: data,
				sort: 'asc'
			})
			allStats.sort((a, b) => +b.dataset[data] - +a.dataset[data]).forEach(item => item.parentNode.appendChild(item))
		}

		if( sort === 'asc' ) {
			setOrder({
				by: data,
				sort: 'desc'
			})
			allStats.sort((a, b) => +a.dataset[data] - +b.dataset[data]).forEach(item => item.parentNode.appendChild(item))
		}
	}

	if (loading) return <Spinner />
	if (error) return <div>Error..</div>
	return (
		<div className="pb-16">
			<h1 className="text-5xl py-2">COVID-19 Stats by Country</h1>
			<input className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 mb-4 block w-full appearance-none leading-normal" type="text" placeholder="Search By Country" onChange={e => handleSearch(e)} />
			<div className="sticky top-0 grid grid-cols-8 gap-2 items-center py-4 px-6 text-xs md:text-sm bg-gray-900 text-gray-200 break-words md:break-normal">
				<div><strong>Country</strong></div>
				<button className={`text-left arrow ${order.by === 'confirmed' ? order.sort : ''}`} onClick={() => handleSort('confirmed', order, setOrder)}><strong>Confirmed</strong></button>
				<button className={`text-left arrow ${order.by === 'c24' ? order.sort : ''}`} onClick={() => handleSort('c24', order, setOrder)}><strong>C 24h Change</strong></button>
				<button className={`text-left arrow ${order.by === 'deaths' ? order.sort : ''}`} onClick={() => handleSort('deaths', order, setOrder)}><strong>Deaths</strong></button>
				<button className={`text-left arrow ${order.by === 'd24' ? order.sort : ''}`} onClick={() => handleSort('d24', order, setOrder)}><strong>D 24h Change</strong></button>
				<button className={`text-left arrow ${order.by === 'recovered' ? order.sort : ''}`} onClick={() => handleSort('recovered', order, setOrder)}><strong>Recovered</strong></button>
				<button className={`text-left arrow ${order.by === 'r24' ? order.sort : ''}`} onClick={() => handleSort('r24', order, setOrder)}><strong>R 24h Change</strong></button>
				<div><strong>Last Updated</strong></div>
			</div>
			{
				countries.map( country => {
					const { name, iso2 } = country
					const countryStatsY = statsY.filter(obj => obj.countryRegion === name)
					return <TableStat key={name} ref={tableEl} country={name} statsY={countryStatsY[0]} url={`https://covid19.mathdro.id/api/countries/${iso2}`} />
				} )
			}
		</div>
	)
}

export default TableStats