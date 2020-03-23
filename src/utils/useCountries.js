import { useState, useEffect } from 'react';

const useCountries = () => {
	const [countries, setCountries] = useState();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState();

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError();
			const data = await fetch('https://covid19.mathdro.id/api/countries')
				.then(res => res.json())
				.catch(err => {
					setError(err);
				});
			setCountries(data.countries);
			setLoading(false);
		}
		fetchData();
	}, []);

	return { countries, loading, error, };
}

export default useCountries