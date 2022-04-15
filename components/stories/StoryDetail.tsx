import { Box, Flex, Heading, IconButton, Stack, Text, Spacer, SimpleGrid } from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'
import { Story } from '../../lib/model/story'
import { ArrowUpIcon, ViewIcon } from '@chakra-ui/icons'
import {
  categoryLabel,
  storyCategoryLabel,
  storyImage,
  storyLocation,
  storyLocationLabels,
  storyName,
  storyDate,
  storyParagraphs,
} from './utils'
import ContentBox from '../common/ContentBox'
import Label, { ContentWarningLabel } from '../common/Label'
import ShareSVG from '../icons/ShareSVG'
import { useState, useEffect } from 'react'
import { Button } from '../common/FloatingRibbon'
import { StorySummary } from './StoryFeed'

const dev = process.env.NODE_ENV !== 'production';
const API_BASE_URL = dev ? 'http://localhost:3000' : 'https://your_deployment.server.com';


function StoryParagraphs(p: string, i: number) {
  return <Text key={i}>{p}</Text>
}

interface StoryDetailProps {
  story: Story
  onClose: () => void
  onShare: () => void
}

export default function StoryDetail({ story, onClose, onShare }: StoryDetailProps) {
  const [upvote_count, set_upvote_count] = useState(story.upvotecount)
  const [upvote_active, set_upvote_active] = useState(true)


  const [rec_data, setData] = useState(null)
  const [rec_data_isLoading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    console.log(API_BASE_URL)
    const id = story.id
    fetch(API_BASE_URL + '/api/stories/viewcount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({ id }),
    })
    fetch(API_BASE_URL + '/api/stories/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({ story }),
    })
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
  }, [])
  var recommended_items = []
  if (!rec_data_isLoading) {
    rec_data ? recommended_items.push(rec_data.map((rec_story)=>(<StorySummary story={rec_story} />))) : console.log("recommended story data not received yet")
  }

  return (
    <Box>
      <Box bgImage={`url(${storyImage(story)})`} bgSize="cover" bgPosition="center" color="white">
        <Box bg="rgba(0, 0, 0, 0.5)">
          <ContentBox>
            <Flex justifyContent="space-between">
              <Label visibility={categoryLabel[story.category] ? 'visible' : 'hidden'}>
                {storyCategoryLabel(story)}
              </Label>

              <Flex>
                <IconButton
                  size="md"
                  variant="link"
                  colorScheme="white"
                  aria-label="Share"
                  icon={<ShareSVG />}
                  onClick={onShare}
                />
                <IconButton
                  size="md"
                  mr={-2}
                  py={2}
                  variant="link"
                  colorScheme="white"
                  aria-label="Close"
                  icon={<CloseIcon />}
                  onClick={onClose}
                />
              </Flex>
            </Flex>
            <Heading
              as="h1"
              my={[5, null, 10]}
              fontSize={['2xl', null, '4xl', '5xl']}
              fontWeight={600}
              fontStyle="italic"
              _before={{ content: `"“"` }}
              _after={{ content: `"”"` }}
            >
              {story.title}
            </Heading>
            <Box fontSize="md" fontWeight={600} lineHeight={1.2}>
              From {storyLocation(story)}
            </Box>
          </ContentBox>
        </Box>
      </Box>
      <ContentBox>
        {story.contentWarning && <ContentWarningLabel mb={4} />}
        <Flex direction="row" align="baseline">
          <Box mb={2}>
            <Flex direction="row" align="baseline">
              {storyLocationLabels(story).map((location) => (
                <Label opaque key={location} mb={4} mr={2}>
                  {location}
                </Label>
              ))}
            </Flex>
          </Box>
          <Spacer />
          <Box mb={2}>
            <Flex>
              <Button mb={4} mr={2}
                onClick={() => {
                  if (upvote_active === true) {
                    set_upvote_count(upvote_count + 1)
                    upvotenow(story.id)
                    set_upvote_active(false)
                  }
                }}
              >
                <ArrowUpIcon w={5} h={5} />
              </Button>
              <Label opaque key={"upvotecount"} bg="white" mb={4} mr={2} pt={2.5}>
                {upvote_count}
              </Label>
            </Flex>
          </Box>
        </Flex>
        <Flex>
          <Box>
            <Heading as="h2" mb={3} fontSize="md" fontWeight={700}>
              {storyDate(story)}
            </Heading>
          </Box>
          <Spacer />
          <Box>
            <Label opaque key={"viewcount"} bg="white" mb={4} mr={2} pt={2.5}>
              <ViewIcon w={35} h={8} mr={5} pb={1} />
              {story.viewCount}
            </Label>
          </Box>
        </Flex>
        <Heading as="h2" mb={4} fontSize="md" fontWeight={700}>
          {storyName(story)}
        </Heading>
        <Stack spacing={2}>{storyParagraphs(story).map(StoryParagraphs)}</Stack>
      </ContentBox>
      <Heading as='h4' ml={"5vw"} mt={"5vh"} size='md' color="primary.100">
        Recommended
      </Heading>
      <SimpleGrid
        as="main"
        columns={[1, null, 2]}
        spacingY={[6, null, 8]}
        spacingX={[6, null, 10, 16]}
        pl={"5vw"}
        pr={"5vw"}
        mt={"5vh"}
      >
        {recommended_items}
      </SimpleGrid>
    </Box>
  )
}

const upvotenow = async (id: string) => {
  await fetch('/api/stories/votes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({ id }),
  })
}


