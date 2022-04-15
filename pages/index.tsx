import NextLink from 'next/link'
import { Box, Link } from '@chakra-ui/react'
import { list } from '../lib/api/stories'
import { StoryFeed } from '../components/stories/StoryFeed'
import FloatingRibbon, { Button } from '../components/common/FloatingRibbon'
import SiteLayout from '../layouts/Default'
import { Story } from '../lib/model/story'
import HeadTags from '../components/common/HeadTags'
import { useRouter } from 'next/router'


// creating an array of city strings
function extract_cities(stories: Story[]): string[] {
  var cities = []
  cities.push('All')
  for (let i = 0; i < stories.length; i += 1) {
    if (!cities.includes(stories[i].postalCode.name)) {
      cities.push(stories[i].postalCode.name)
    }
  }
  return cities
}

interface MainPageProps {
  stories: Story[]
}

const MainPage = ({ stories }: MainPageProps) => {
  var cities = extract_cities(stories)
  const router = useRouter()
  const query = router.query
  var filtering_city = 'All'
  // filtering stories array to contain only stories with city name from url string
  if (query.hasOwnProperty('Geolocation')) {
    filtering_city = query['Geolocation'] as string
    if (query['Geolocation'] != 'All') {
      stories = stories.filter(story => story.postalCode.name === query['Geolocation'])
    }
  }


  return (
    <>
      <HeadTags>
        <link rel="canonical" href="https://www.mycovidstory.ca" />
      </HeadTags>

      <Box>
        <StoryFeed stories={stories} cities={cities} filtering_by={filtering_city} />
      </Box>

      <FloatingRibbon>
        <NextLink href="/new" passHref>
          <Link>
            <Button my={'5px'}>Add Your Story</Button>
          </Link>
        </NextLink>
      </FloatingRibbon>
    </>
  )
}

export async function getStaticProps() {
  const stories = await list()
  return {
    props: { stories },
    revalidate: 60, // 1 minute
  }
}

const MainPageLayout = ({ children }) => <SiteLayout stickyNav>{children}</SiteLayout>

MainPage.setLayout = MainPageLayout

export default MainPage
