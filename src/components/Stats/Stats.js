import React from 'react'
import useStats from '../../utils/useStats'
import Spinner from '../Spinner/Spinner'

const Stats = ({ url }) => {
	const { stats, loading, error } = useStats(url)
	if (loading) return <Spinner />
	if (error) return <p>Error...</p>
	const { confirmed, deaths, recovered, lastUpdate } = stats
	const date = new Date(lastUpdate)
	return (
		<div className="text-3xl py-2">
			<h1 className="text-5xl py-2">World Stats</h1>
			<div className="sticky top-0 grid grid-cols-4 gap-2 py-4 px-6 text-sm bg-gray-900 text-gray-200">
				<div><strong>Total Confirmed</strong></div>
				<div><strong>Total Deaths</strong></div>
				<div><strong>Total Recovered</strong></div>
				<div><strong>Last Updated</strong></div>
			</div>
			<div className="grid grid-cols-4 gap-2 items-center bg-gray-200 hover:bg-gray-400 py-4 px-6 border-b border-l border-r border-gray-400">
				<p>{confirmed.value}</p>
				<p>{deaths.value}</p>
				<p>{recovered.value}</p>
				<p className="text-base">{date.toLocaleString()}</p>
			</div>
		</div>
	)
}

export default Stats