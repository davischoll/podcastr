// SPA => Single Page Application
// SSR => Server Side Rendering
// SSG => Static Site Generator

/*
  REQUISIÇÃO NO MODELO 'SPA':
  Os dados que serão puxados da api, serão carregados somente no momento em que a pessoa acessa a tela da app
  e o conteúdo da página será montado pelo javascrip do browser posteriormente.
  Exemplo com uso de "React puro":

   useEffect:
   Uma função (hook) do React que dispara algo, sempre que algo mudar na aplicação.
   É basicamente para isto: efeitos colaterais. Quando algo mudar na app, quero que alguma coisa aconteça
    - 1o parâmetro: O QUE eu quero executar: () => {}
    - 2o parâmetro: QUANDO: []  // um array q recebe qualquer variável
      * Se uma variável é passada, pelo Home(variavel), para o array do useEffect, toda vez que essa variável mudar,
        o código do primeiro parâmetro será executado novamente.
      * No React, quando queremos que uma função execute uma única vez, assim que o componente for exibido em tela,
        basta informar um array vazio [] no segundo parâmetro do useEffect.
*/

  // import { useEffect } from "react"

  // export default function Home() {
  //   useEffect(() => {
  //     fetch('http://localhost:3333/episodes')
  //       .then(response => response.json())
  //       .then(data => console.log(data))
  //   }, [])

  //   return (
  //     <h1>Index</h1>
  //   )
  // }

/*
  REQUISIÇÃO NO MODELO 'SSR':
  Com o Next.js, basta exportar uma função chamada getServerSideProps()
  Apenas exportando essa função, o Next já entende que ele precisa executá-la antes de exibir o conteúdo da
  página Home() para o usuário final.
    - Transformamos essa função em async e ela retorna um objeto, que contem o dado 'props', onde especificamos
      quais dados queremos puxar.
    - É preciso sempre retornar "props"!
    - Tudo o que retornamos de "props", será repassado para o componente Home(props)
  
  OBS:
  DIFERENÇA DO SSR P/ SSG:
    getServerSideProps() será executado todas as vezes que alguém acessar a home da aplicação.
    Mas se a home não sofre alterações constantes, a toda hora, não se faz necessário todas as vezes
    ir até a API e buscar as informações.
*/

// export default function Home(props) { 
//   return (
//     <div>
//       <h1>Index</h1>
//       <p>{JSON.stringify(props.episodes)}</p> 
//     </div>
//   )
// }

// export async function getServerSideProps() {
  
//   const response = await fetch('http://localhost:3333/episodes')
//   const data = await response.json()

//   return {
//     props: {
//       episodes: data
//     }
//   }
// }


/*
  REQUISIÇÃO NO MODELO SSG:
  Assim que uma pessoa acessa a página, uma versão estática dela é gerada, e essa página (que é um HTML puro),
  será servida para todas as pessoas que acessarem aquela mesma página depois dessa primeira. Todas estarão
  visualizando exatamente o mesmo conteúdo. Não é necessário fazer uma nova requisição para a Api.

  - Para usar SSG, basta trocar o nome do método para getStaticProps(). Não é necessário fazer mais nada!

  O que pode-se fazer é passar mais uma opção, abaixo de props, chamada 'revalidate':
    - "revalidate" recebe um número, em segundos, que diz de quanto em quanto tempo queremos gerar uma nova
      versão desta página. (Ex: 60s * 60 * 8) = 3x por dia.
    Todas as pessoas que acessarem nesse intervalo de tempo, vão consumir o html estático dessa página.
  
  OBS:
    Este recurso de SSG só funciona em produção.
    Então é necessário gerar uma build do projeto, para simular que estamos com a app rodando em produção:
    - executar $ yarn build
    - rodar o projeto com $ yarn start
*/

// export default function Home(props) { 
//   return (
//     <div>
//       <h1>Index</h1>
//       <p>{JSON.stringify(props.episodes)}</p> 
//     </div>
//   )
// }

// export async function getStaticProps() {
  
//   const response = await fetch('http://localhost:3333/episodes')
//   const data = await response.json()

//   return {
//     props: {
//       episodes: data
//     },
//     revalidate: 60 * 60 * 8
//   }
// }


import { GetStaticProps } from 'next'  // Tipagem da função, determina como é o formato da função, qual é o seu retorno etc...
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '../services/api'
import { convertDurationToTimeString } from '../util/convertDurationToTimeString'

import styles from './home.module.scss'
import { useContext } from 'react'
import { PlayerContext } from '../contexts/PlayerContext'

type Episode = {
  id: string
  title: string
  thumbnail: string
  members: string
  publishedAt: string
  duration: number
  durationAsString: string
  url: string
}

type HomeProps = {
  latestEpisodes: Array<Episode>   // Ou latestEpisodes: Episode[]
  allEpisodes: Episode[]
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
  const { playList } = useContext(PlayerContext)

  const episodeList = [...latestEpisodes, ...allEpisodes]

  return (
    <div className={styles.homepage}>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map((episode, index) => {
            return (
              <li key={episode.id}>
                <span style={{ width: 90 }}>
                  <Image
                    width={192}
                    height={192}
                    src={episode.thumbnail}
                    alt={episode.title}
                    objectFit="cover"
                  />
                </span>

                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="Tocar episódio"/>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos os episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map((episode, index) => {
              return (
                <tr key={episode.id}>
                  <td style={{ width: 72 }}>
                    <Image
                      width={120}
                      height={120}
                      src={episode.thumbnail}
                      alt={episode.title}
                      objectFit="cover"
                    />
                  </td>
                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{ width: 100 }}>{episode.publishedAt}</td>
                  <td>{episode.durationAsString}</td>
                  <td>
                    <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                      <img src="/play-green.svg" alt="Tocar episódio"/>
                    </button>
                  </td>

                </tr>
              )
            })}
          </tbody>

        </table>
      </section>
    </div>
  )
}

export const getStaticProps:GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url,
    }
  })

  const latestEpisodes = episodes.slice(0, 2)
  const allEpisodes    = episodes.slice(2, episodes.length)

  return {
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8
  }
}
