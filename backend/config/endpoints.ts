export interface EndpointParam {
  name: string;
  type: 'string' | 'url';
  required: boolean;
  description: string;
  example: string;
}

export interface ApiEndpointDefinition {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  method: 'GET';
  path: string;
  upstreamPath: string;
  description: string;
  params: EndpointParam[];
  optionalParams?: EndpointParam[];
  exampleResponse: Record<string, unknown>;
}

export interface ApiCategorySummary {
  id: string;
  name: string;
  description: string;
  endpointCount: number;
}

export const API_ENDPOINTS: ApiEndpointDefinition[] = [
  // 1. Sinhalasub API
  {
    id: 'sinhalasub-search',
    categoryId: 'sinhalasub',
    categoryName: 'Sinhalasub API',
    name: 'Search Movies & TV Shows',
    method: 'GET',
    path: '/sinhalasub/search',
    upstreamPath: '/sinhalasub/search',
    description: 'Search movies and TV series with Sinhala subtitles from Sinhalasub.',
    params: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Movie or TV show search keyword.',
        example: 'spider',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/sinhalasub/search',
      responseTimeMs: 420,
      data: {
        status: true,
        data: {
          query: 'spider',
          total_results: 14,
          results: [
            {
              title: 'Spider-Man (MCU) Collection',
              url: 'https://sinhalasub.lk/movies/spider-man-3-2007-sinhala-subtitles/',
            },
          ],
        },
      },
    },
  },
  {
    id: 'sinhalasub-tvshow',
    categoryId: 'sinhalasub',
    categoryName: 'Sinhalasub API',
    name: 'TV Show Details & Episodes',
    method: 'GET',
    path: '/sinhalasub/tvshow',
    upstreamPath: '/sinhalasub/tvshow',
    description: 'Retrieve TV show metadata, ratings, genres, and episode list from a Sinhalasub TV show URL.',
    params: [
      {
        name: 'url',
        type: 'url',
        required: true,
        description: 'Full Sinhalasub TV show page URL.',
        example: 'https://sinhalasub.lk/tvshows/matka-king-2026-sinhala-subtitles/',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/sinhalasub/tvshow',
      responseTimeMs: 510,
      data: {
        status: true,
        data: {
          title: 'Matka King (2026)',
          rating: { score: '4', votes: '1 vote' },
          genres: [],
          episodes: [],
        },
      },
    },
  },
  {
    id: 'sinhalasub-episode-info',
    categoryId: 'sinhalasub',
    categoryName: 'Sinhalasub API',
    name: 'Episode Info & Servers',
    method: 'GET',
    path: '/sinhalasub/episode-info',
    upstreamPath: '/sinhalasub/episode-info',
    description: 'Fetch episode details and available download server links for a Sinhalasub episode URL.',
    params: [
      {
        name: 'url',
        type: 'url',
        required: true,
        description: 'Full Sinhalasub episode page URL.',
        example: 'https://sinhalasub.lk/episodes/matka-king-s01e04/',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/sinhalasub/episode-info',
      responseTimeMs: 495,
      data: {
        status: true,
        timestamp: '2026-11-18T01:24:53.201Z',
        data: {
          episode: {
            title: 'Matka King S01E04',
            season: 1,
            episode: 4,
          },
        },
      },
    },
  },
  {
    id: 'sinhalasub-info',
    categoryId: 'sinhalasub',
    categoryName: 'Sinhalasub API',
    name: 'Movie Details & Downloads',
    method: 'GET',
    path: '/sinhalasub/info',
    upstreamPath: '/sinhalasub/info',
    description: 'Retrieve movie synopsis, poster, metadata, and download portal links from Sinhalasub.',
    params: [
      {
        name: 'url',
        type: 'url',
        required: true,
        description: 'Full Sinhalasub movie page URL.',
        example: 'https://sinhalasub.lk/movies/spider-man-3-2007-sinhala-subtitles/',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/sinhalasub/info',
      responseTimeMs: 480,
      data: {
        status: true,
        data: {
          movie: {
            title: 'Spider-Man 3 (2007) Sinhala Subtitles',
            poster: 'https://image.tmdb.org/t/p/w154/...',
          },
        },
      },
    },
  },
  {
    id: 'sinhalasub-download2',
    categoryId: 'sinhalasub',
    categoryName: 'Sinhalasub API',
    name: 'Direct Download Link',
    method: 'GET',
    path: '/sinhalasub/download2',
    upstreamPath: '/sinhalasub/download2',
    description: 'Resolve a Sinhalasub portal link into a direct CDN file download URL.',
    params: [
      {
        name: 'url',
        type: 'url',
        required: true,
        description: 'Sinhalasub download portal link URL.',
        example: 'https://sinhalasub.lk/links/xqmtfqgrto/',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/sinhalasub/download2',
      responseTimeMs: 530,
      data: {
        status: true,
        data: {
          title: 'Matka King:- S01:E04 - Download Portal',
          download: 'https://cdn.sinhalasub.net/...',
        },
      },
    },
  },

  // 2. Cinesubz API
  {
    id: 'cinesubz-search',
    categoryId: 'cinesubz',
    categoryName: 'Cinesubz API',
    name: 'Search Cinesubz Catalog',
    method: 'GET',
    path: '/cinesubz/search',
    upstreamPath: '/cinesubz/search',
    description: 'Search movies and TV series indexed on Cinesubz.',
    params: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Search query keyword.',
        example: 'spider',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/cinesubz/search',
      responseTimeMs: 390,
      data: {
        status: true,
        message: 'Success',
        total: 30,
        query: 'spider',
        results: [
          {
            title: 'Spider-Man: Brand New Day (2026) Sinhala Subtitles',
            link: 'https://cinesubz.net/movies/spider-man-brand-new-day-2026-sinhala-subtitles/',
          },
        ],
      },
    },
  },
  {
    id: 'cinesubz-details',
    categoryId: 'cinesubz',
    categoryName: 'Cinesubz API',
    name: 'Cinesubz Movie Details',
    method: 'GET',
    path: '/cinesubz/details',
    upstreamPath: '/cinesubz/details',
    description: 'Fetch full movie details, IMDb rating, cast, and download links from Cinesubz.',
    params: [
      {
        name: 'url',
        type: 'url',
        required: true,
        description: 'Full Cinesubz movie page URL.',
        example: 'https://cinesubz.net/movies/spider-man-brand-new-day-2026-sinhala-subtitles/',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/cinesubz/details',
      responseTimeMs: 615,
      data: {
        status: true,
        data: {
          title: 'Spider-Man: Brand New Day (2026) Sinhala Subtitles',
          imdb_rating: '8.5',
          year: '2026',
          downloads: [],
        },
      },
    },
  },
  {
    id: 'cinesubz-tvshow',
    categoryId: 'cinesubz',
    categoryName: 'Cinesubz API',
    name: 'Cinesubz TV Show Info',
    method: 'GET',
    path: '/api/tvshow',
    upstreamPath: '/api/tvshow',
    description: 'Fetch TV series overview, seasons, and episode links from Cinesubz.',
    params: [
      {
        name: 'url',
        type: 'url',
        required: true,
        description: 'Full Cinesubz TV show page URL.',
        example: 'https://cinesubz.net/tvshows/spider-noir-2026-tv-series/',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/api/tvshow',
      responseTimeMs: 540,
      data: {
        status: 'success',
        data: {
          success: true,
          type: 'tvshow',
          url: 'https://cinesubz.net/tvshows/spider-noir-2026-tv-series/',
          title: 'Spider-Noir (2026) TV Series | S01 | Complete',
        },
      },
    },
  },
  {
    id: 'cinesubz-episode',
    categoryId: 'cinesubz',
    categoryName: 'Cinesubz API',
    name: 'Episode Quality Links',
    method: 'GET',
    path: '/api/episode',
    upstreamPath: '/api/episode',
    description: 'Extract episode quality options and download links for a Cinesubz episode.',
    params: [
      {
        name: 'url',
        type: 'url',
        required: true,
        description: 'Full Cinesubz episode URL.',
        example: 'https://cinesubz.net/episodes/spider-noir-ep02-black-white/',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/api/episode',
      responseTimeMs: 470,
      data: {
        status: 'success',
        data: {
          success: true,
          type: 'episode',
          url: 'https://cinesubz.net/episodes/spider-noir-ep02-black-white/',
          episode: { season: '1', episode: '2' },
        },
      },
    },
  },
  {
    id: 'cinesubz-dl',
    categoryId: 'cinesubz',
    categoryName: 'Cinesubz API',
    name: 'Cinesubz Movie Download',
    method: 'GET',
    path: '/dl/cinesubz',
    upstreamPath: '/movie/cinesubz',
    description: 'Resolve a Cinesubz zt-links download page into direct file download mirrors.',
    params: [
      {
        name: 'url',
        type: 'url',
        required: true,
        description: 'Cinesubz download link URL (zt-links).',
        example: 'https://cinesubz.net/zt-links/nvm2e3d9ep/',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/dl/cinesubz',
      responseTimeMs: 590,
      data: {
        status: true,
        data: {
          title: 'Movie Download Mirrors',
          download: 'https://...',
        },
      },
    },
  },

  // 3. Chithrapata API
  {
    id: 'chithrapata-search',
    categoryId: 'chithrapata',
    categoryName: 'Chithrapata API',
    name: 'Search Chithrapata',
    method: 'GET',
    path: '/chithrapata/search',
    upstreamPath: '/chithrapata/search',
    description: 'Search Sinhala-subtitled cinema listings from Chithrapata.',
    params: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Movie title or keyword.',
        example: 'spider',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/chithrapata/search',
      responseTimeMs: 360,
      data: {
        status: true,
        message: 'Success',
        total: 2,
        query: 'spider',
        results: [
          {
            title: 'Spider-Man: Brand New Day (2026) Sinhala Subtitles',
            link: 'https://chithrapata.com/movies/spider-man-brand-new-day-2026-sinhala-subtitles/',
          },
        ],
      },
    },
  },
  {
    id: 'chithrapata-info',
    categoryId: 'chithrapata',
    categoryName: 'Chithrapata API',
    name: 'Chithrapata Movie Info',
    method: 'GET',
    path: '/chithrapata/info',
    upstreamPath: '/chithrapata/info',
    description: 'Fetch detailed movie metadata, poster, and links from Chithrapata.',
    params: [
      {
        name: 'url',
        type: 'url',
        required: true,
        description: 'Full Chithrapata movie page URL.',
        example: 'https://chithrapata.com/movies/spider-man-brand-new-day-2026-sinhala-subtitles/',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/chithrapata/info',
      responseTimeMs: 440,
      data: {
        status: true,
        message: 'Success',
        data: {
          title: 'Spider-Man: Brand New Day (2026) Sinhala Subtitles',
          type: 'Movie',
          poster: 'https://image.tmdb.org/t/p/...',
        },
      },
    },
  },

  // 4. Past Papers API
  {
    id: 'pastpapers-search',
    categoryId: 'pastpapers',
    categoryName: 'Past Papers API',
    name: 'Search Past Papers',
    method: 'GET',
    path: '/pastpapers/search',
    upstreamPath: '/pastpapers/search',
    description: 'Search Sri Lankan school exam papers, term tests, and marking schemes.',
    params: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Subject, grade, or exam keyword.',
        example: 'maths',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/pastpapers/search',
      responseTimeMs: 410,
      data: {
        status: true,
        version: 'v1.0.0',
        results: [
          {
            title: 'Northern Province 2025 Grade 11 Maths 3rd Term Test Paper',
            url: 'https://pastpapers.wiki/northern-province-2025-grade-11-maths-3rd-term-test-paper-tamil-medium/',
          },
        ],
      },
    },
  },
  {
    id: 'pastpapers-info',
    categoryId: 'pastpapers',
    categoryName: 'Past Papers API',
    name: 'Past Paper Details & PDF',
    method: 'GET',
    path: '/pastpapers/info',
    upstreamPath: '/pastpapers/info',
    description: 'Get full past paper details and direct PDF download links.',
    params: [
      {
        name: 'url',
        type: 'url',
        required: true,
        description: 'Full PastPapers.wiki article URL.',
        example: 'https://pastpapers.wiki/northern-province-2025-grade-11-maths-3rd-term-test-paper-tamil-medium/',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/pastpapers/info',
      responseTimeMs: 455,
      data: {
        status: true,
        version: 'v1.0.0',
        data: {
          title: 'Northern Province 2025 Grade 11 Maths 3rd Term Test Paper',
          pdf_links: [],
        },
      },
    },
  },

  // 5. Tinkiri API
  {
    id: 'tinkiri-search',
    categoryId: 'tinkiri',
    categoryName: 'Tinkiri API',
    name: 'Search Tinkiri Movies',
    method: 'GET',
    path: '/tinkiri/search',
    upstreamPath: '/tinkiri/search',
    description: 'Search Hollywood and international movie releases via Tinkiri.',
    params: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Movie title keyword.',
        example: 'spider',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/tinkiri/search',
      responseTimeMs: 385,
      data: {
        status: true,
        timestamp: '2026-11-18T01:25:19.197Z',
        data: {
          query: 'spider',
          total_results: 10,
          pagination: { current_page: 1 },
        },
      },
    },
  },
  {
    id: 'tinkiri-details',
    categoryId: 'tinkiri',
    categoryName: 'Tinkiri API',
    name: 'Tinkiri Movie Details',
    method: 'GET',
    path: '/tinkiri/details',
    upstreamPath: '/tinkiri/details',
    description: 'Retrieve Tinkiri movie details, metadata, and direct download mirrors.',
    params: [
      {
        name: 'url',
        type: 'url',
        required: true,
        description: 'Full TheNkiri movie page URL.',
        example: 'https://thenkiri.com/spider-man-brand-new-day-2026-download-hollywood-movie/',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/tinkiri/details',
      responseTimeMs: 465,
      data: {
        status: true,
        data: {
          movie: {
            title: 'Spider-Man: Brand New Day (2026)',
            url: 'https://thenkiri.com/spider-man-brand-new-day-2026-download-hollywood-movie/',
          },
        },
      },
    },
  },

  // 6. YouTube MP3 API
  {
    id: 'ytmp3-download',
    categoryId: 'youtube',
    categoryName: 'YouTube MP3 API',
    name: 'YouTube MP3 Audio Extractor',
    method: 'GET',
    path: '/api/ytmp3',
    upstreamPath: '/api/ytmp3',
    description: 'Extract MP3 audio metadata, thumbnail, and download URL from a YouTube video link.',
    params: [
      {
        name: 'url',
        type: 'url',
        required: true,
        description: 'Valid YouTube watch or share URL (youtu.be or youtube.com).',
        example: 'https://youtu.be/q3QcfUL3O2c?si=ZcySd-ARN9WFntGF',
      },
    ],
    exampleResponse: {
      success: true,
      status: 200,
      endpoint: '/api/ytmp3',
      responseTimeMs: 680,
      data: {
        status: 'success',
        data: {
          title: 'Numbata pana',
          download_url: 'https://cdn403.savetube.vip/media/...',
          thumbnail: 'https://i.ytimg.com/...',
        },
      },
    },
  },
];

export const API_CATEGORIES: ApiCategorySummary[] = [
  {
    id: 'sinhalasub',
    name: 'Sinhalasub API',
    description: 'Search movies & series, retrieve TV episode metadata, and resolve direct download links.',
    endpointCount: API_ENDPOINTS.filter((e) => e.categoryId === 'sinhalasub').length,
  },
  {
    id: 'cinesubz',
    name: 'Cinesubz API',
    description: 'Full Cinesubz movie & TV show catalog search, episode quality extraction, and link resolution.',
    endpointCount: API_ENDPOINTS.filter((e) => e.categoryId === 'cinesubz').length,
  },
  {
    id: 'chithrapata',
    name: 'Chithrapata API',
    description: 'Sinhala-subtitled cinema discovery and movie information lookup.',
    endpointCount: API_ENDPOINTS.filter((e) => e.categoryId === 'chithrapata').length,
  },
  {
    id: 'pastpapers',
    name: 'Past Papers API',
    description: 'Search Sri Lankan school exam papers, term tests, and extract direct PDF links.',
    endpointCount: API_ENDPOINTS.filter((e) => e.categoryId === 'pastpapers').length,
  },
  {
    id: 'tinkiri',
    name: 'Tinkiri API',
    description: 'Search Hollywood releases and retrieve direct movie details and mirrors.',
    endpointCount: API_ENDPOINTS.filter((e) => e.categoryId === 'tinkiri').length,
  },
  {
    id: 'youtube',
    name: 'YouTube MP3 API',
    description: 'Extract MP3 audio tracks, titles, and thumbnails from YouTube URLs.',
    endpointCount: API_ENDPOINTS.filter((e) => e.categoryId === 'youtube').length,
  },
];
