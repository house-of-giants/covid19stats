import React from 'react'

import Layout from '../theme/layout'
import TableStats from '../components/TableStats/TableStats'
import Stats from '../components/Stats/Stats'

export default () => (
	<>
		<div className="font-xs bg-gray-900 text-gray-200 text-center p-2">
			<p>Data sourced from <a className="text-blue-300" href="https://github.com/mathdroid/covid-19-api" target="_blank" rel="noopener noreferrer">https://github.com/mathdroid/covid-19-api</a></p>
		</div>
		<Layout>
			<Stats url="https://covid19.mathdro.id/api" />
			<TableStats />
		</Layout>
	</>
)
