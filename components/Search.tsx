import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { makeBotURL, redirectTo } from '@utils/Tools'
import Fetch from '@utils/Fetch'
import { BotList, ResponseProps } from '@types'

import DiscordAvatar from '@components/DiscordAvatar'

const Search = (): JSX.Element => {
	const router = useRouter()
	const [query, setQuery] = useState('')
	const [data, setData] = useState<ResponseProps<BotList>>(null)
	const [loading, setLoading] = useState(false)
	const [abortControl, setAbortControl] = useState(new AbortController())
	const [hidden, setHidden] = useState(true)
	const SearchResults = async (value: string) => {
		setQuery(value)
		try {
			abortControl.abort()
		} catch {
			return null
		}
		const controller = new AbortController()
		setAbortControl(controller)
		if (value.length > 2) setLoading(true)
		const res = await Fetch<BotList>(`/search/bots?q=${encodeURIComponent(value)}`, {
			signal: controller.signal,
		})
		setData(res)
		setLoading(false)
	}

	const onSubmit = async () => {
		setHidden(true)
		redirectTo(router, `/search/?q=${encodeURIComponent(query)}`)
	}

	return (
		<div>
			<div
				onFocus={() => setHidden(false)}
				onBlur={() => setTimeout(() => setHidden(true), 80)}
				className='relative z-10 flex mt-5 w-full text-black dark:text-gray-100 dark:bg-very-black bg-white rounded-lg'
			>
				<input
					maxLength={50}
					className='flex-grow pr-20 px-7 py-3 h-16 text-xl bg-transparent border-0 border-none outline-none shadow'
					placeholder='검색...'
					value={query}
					onChange={e => {
						SearchResults(e.target.value)
					}}
					onKeyDown={e => {
						if (e.key === 'Enter') return onSubmit()
					}}
				/>
				<button
					className='cusor-pointer absolute right-0 top-0 mr-5 mt-5 outline-none'
					onClick={onSubmit}
				>
					<i className='fas fa-search text-gray-600 hover:text-gray-700 text-2xl' />
				</button>
			</div>
			<div className={`relative ${hidden ? 'hidden' : 'block'}`}>
				<div className='pin-t pin-l absolute my-2 w-full h-60 text-black dark:text-gray-100 dark:bg-very-black bg-white rounded shadow-md overflow-y-scroll md:h-80'>
					<ul>
						{data && data.code === 200 && data.data ? (
							data.data.data.length === 0 ? (
								<li className='px-3 py-3.5'>검색 결과가 없습니다.</li>
							) : (
								data.data.data.map(el => (
									<Link key={el.id} href={makeBotURL(el)}>
										<li className='h-15 flex px-3 py-2 cursor-pointer'>
											<DiscordAvatar className='mt-1 w-12 h-12' size={128} userID={el.id} />
											<div className='ml-2'>
												<h1 className='text-black dark:text-gray-100 text-lg'>{el.name}</h1>
												<p className='text-gray-400 text-sm'>{el.intro}</p>
											</div>
										</li>
									</Link>
								))
							)
						) : loading ? (
							<li className='px-3 py-3.5'>검색중입니다...</li>
						) : (
							<li className='px-3 py-3.5'>
								{query && data ? (
									data.message?.includes('문법') ? (
										<>
											검색 문법이 잘못되었습니다.
											<br />
											<a
												className='hover:text-blue-400 text-blue-500'
												href='https://docs.koreanbots.dev/bots/usage/search'
												target='_blank'
												rel='noreferrer'
											>
												더 알아보기
											</a>
										</>
									) : (
										(data.errors && data.errors[0]) || data.message
									)
								) : query.length < 3 ? (
									'최소 2글자 이상 입력해주세요.'
								) : (
									'검색어를 입력해주세요.'
								)}
							</li>
						)}
					</ul>
				</div>
			</div>
		</div>
	)
}

export default Search
