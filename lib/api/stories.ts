import { PrismaClientValidationError } from '@prisma/client/runtime'
import { ValidationError } from 'yup'
import prisma from '../prisma'
import storySchema from '../storySchema'
import { SELECT, fixTitle } from '../model/story'
import { badRequest, internalServerError, notFound } from '../errors'
import fs from 'fs'
const { createCanvas, loadImage } = require('canvas')
const csv = require('csv-parser');
// import { parse } from 'csv-parse'

const northmost = (83 + (6 / 60) + (41 / 3600)) * (Math.PI / 180)
const southmost = (41 + (40 / 60) + (53 / 3600)) * (Math.PI / 180)
const eastmost = (52 + (37 / 60) + (10 / 3600)) * (Math.PI / 180)
const westmost = (141 + (7 / 3600)) * (Math.PI / 180)
const earthrad = 6371
const lon0 = westmost
const lat0 = northmost

function haversine_dist(lon1: number, lon2: number, lat1: number, lat2: number) {
  let dlon = lon2 - lon1
  let dlat = lat2 - lat1
  let a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2
  let c = 2 * Math.asin(Math.sqrt(a))
  return c * earthrad
}

function max_dists(lon: number, lat: number) {
  let x = haversine_dist(westmost, eastmost, lat, lat)
  let y = haversine_dist(lon, lon, northmost, southmost)
  return { x, y }
}

// GET /api/stories
export async function list(limit: number = null) {
  const takeLimit = { take: limit }
  try {
    return await prisma.story.findMany({
      where: { approved: true },
      orderBy: { updatedAt: 'desc' },
      select: SELECT,
      ...(limit && takeLimit),
    })
  } catch (err) {
    console.error('Failed to retrieve stories:', err)
    throw internalServerError()
  }
}

export interface NewStory {
  title: string
  content: string
  postal: string
  category: string
  contactName?: string
  displayName?: string
  email?: string
  phone?: string
  twitter?: string
  consent?: boolean
}

// POST /api/stories
export async function add(story: NewStory) {
  const payload = Object.keys(story).reduce((acc, k) => {
    // Strip empty values
    if (story[k] === '') {
      return acc
      // Clean up title
    } else if (k === 'title') {
      acc[k] = fixTitle(story[k])
      // Uppercase postal
    } else if (k === 'postal') {
      acc[k] = story[k].toUpperCase()
      // Don't forget the rest
    } else {
      acc[k] = story[k]
    }
    return acc
  }, {}) as NewStory

  try {
    // Validate the payload against the schema
    await storySchema.validate(payload)
    return await prisma.story.create({
      data: {
        title: payload.title,
        content: payload.content,
        postal: payload.postal,
        category: payload.category,
        contactName: payload.contactName,
        displayName: payload.displayName,
        email: payload.email,
        phone: payload.phone,
        twitter: payload.twitter,
      },
    })
  } catch (err) {
    if (err instanceof ValidationError) {
      throw badRequest({ detail: `Invalid story: ${err}` })
    } else {
      console.error('Failed to add story:', err)
      throw internalServerError()
    }
  }
}

// GET /api/stories/:id
export async function get(id: string) {
  try {
    const story = await prisma.story.findUnique({ where: { id: id }, select: SELECT })
    if (story != null && story.approved) {
      return story
    }
  } catch (err) {
    if (!(err instanceof PrismaClientValidationError)) {
      console.error(`Failed to retrieve story ${id}:`, err)
      throw internalServerError()
    }
  }
  throw notFound()
}

//update story upvotes api
export async function upvote(storyid: string) {
  const storyCurrentVoteCount = await prisma.story.findUnique({
    where: {
      id: storyid['id'],
    },
    select: {
      upvotecount: true
    },
  })
  return await prisma.story.update({
    where: {
      id: storyid['id'],
    },
    data: {
      upvotecount: storyCurrentVoteCount.upvotecount + 1,
    },
  })

}

//function to increment upvote in the database
export async function increment_viewcount(storyid: string) {
  console.log("Incrementing view count")
  console.log(storyid)
  const storyCurrentVoteCount = await prisma.story.findUnique({
    where: {
      id: storyid['id'],
    },
    select: {
      viewCount: true
    },
  })
  return await prisma.story.update({
    where: {
      id: storyid['id'],
    },
    data: {
      viewCount: storyCurrentVoteCount.viewCount + 1,
    },
  })

}

// function to update the map png at server (using canvas library) whenever a new story is posted
export async function update_map() {
  //function to edit image
  const city_to_postal = new Map();
  const postal_to_latlon = new Map();
  //importing postal data
  fs.createReadStream('./canadamap/CanadianPostalCodes202201.csv')
    .pipe(csv())
    .on('data', (row) => {
      if (row['CITY'] in city_to_postal) {
        if (row['POSTAL_CODE'].substring(0, 3) in city_to_postal[row['CITY']]) {
          city_to_postal[row['CITY']].append(row['POSTAL_CODE'].substring(0, 3))
        }
      }
      else {
        city_to_postal.set(row['CITY'], row['POSTAL_CODE'].substring(0, 3))
      }

      if (row['POSTAL_CODE'].substring(0, 3) in postal_to_latlon) {
      }
      else {
        postal_to_latlon.set(row['POSTAL_CODE'].substring(0, 3), { lon: row['LONGITUDE'], lat: row['LATITUDE'] })
      }
    })
    .on('end', async () => {
      //console.log('CSV file successfully processed');
      //redraw the map
      //load all postal codes form database
      const postal_list = await prisma.story.findMany({
        select: {
          postal: true,
        },
      })
      const width = 3244
      const height = 1408
      const canvas = createCanvas(width, height)
      const context = canvas.getContext('2d')
      //load canada map empty image
      loadImage('./canadamap/flat_canada_black_cropped_no_boundary.jpg').then(image => {
        context.drawImage(image, 0, 0, 3244, 1408)
        context.globalAlpha = 0.3; //turning transparency on
        let drawn_postals = []
        //loop over the retrieved postals list from database and draw a circle for each
        for (const postal of postal_list) {
          //console.log(postal.postal)
          //if current postal has already been looped over once, then skip it
          if (drawn_postals.includes(postal.postal)) {
            continue
          }
          else {
            drawn_postals.push(postal.postal)
          }
          let { lon, lat } = postal_to_latlon.get(postal.postal)
          let la = lat
          let lo = lon
          if (lo < 0.0)
            lo *= -1.0
          if (la < 0.0)
            la *= -1.0
          la = la * (Math.PI / 180)
          lo = lo * (Math.PI / 180)
          //console.log("lon, lat: " + lo + "|" + la)
          let _x = haversine_dist(lo, lon0, la, la)
          let _y = haversine_dist(lo, lo, la, lat0)
          //console.log("haver: " + _x + "||" + _y)
          let { x, y } = max_dists(lo, la)
          //console.log("max: " + x + "}{" + y)
          let xpix = Math.floor(_x / x * 3244) //#original width
          let ypix = Math.floor(_y / y * 4208) //#original height
          //console.log(xpix + "|||" + ypix)
          ypix = ypix - 2800

          //choose random radius for the circles to be drawn. Done for aesthetic purposes.
          let rand = 40 + Math.floor(Math.random() * 60)

          //adjust radius if the postal location on image is too close to the image edges
          if (rand > 1408 - ypix)
            rand = 1408 - ypix
          if (rand > 3244 - xpix)
            rand = 3244 - xpix

          //console.log(xpix + "|" + ypix + "|" + rand)

          context.beginPath()
          context.arc(xpix, ypix, rand, 0, 2 * Math.PI)
          context.fillStyle = 'purple';
          context.fill()
        }
        const buffer = canvas.toBuffer('image/png')
        fs.writeFileSync('./public/canadamap_mainpage.png', buffer)
      })
    });
}

//funciton to query the dataase for 3 stories with similar categories as the client story
export async function get_recommends(story_category: { story }) {
  var recommends = []
  const same_category_stories = await prisma.story.findMany({
    where: {
      category: story_category.story.category,
    },
    select: SELECT,
  })
  let count = 0;
  for (const s in same_category_stories) {
    if (count == 3) {
      break
    }
    recommends.push(same_category_stories[s])
    count = count + 1
  }
  return recommends

}