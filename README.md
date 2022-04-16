# My Covid Story

This is an extremely early MVP, so there is a lot to do.

Our stack / architecture is:

- [NextJS](https://next.js.org/) hosted on [Vercel](https://vercel.com) (already setup here)
- [Prisma](https://prisma.io) as our ORM (makes things pretty smooth)
- [PostgreSQL](https://www.postgresql.org/) Managed Database from [Digital Ocean](https://www.digitalocean.com/).

## Quick Start

1. Clone this repo.
1. Install dependencies with `npm i`.
1. Copy `.env.template` to `.env`.
1. Get a local postgres db running.
   Docker is probably easiest, but local postgres would also work.
   With Docker installed, run `docker run --name my-covid-story-dev -p 5432:5432 -e POSTGRES_PASSWORD=mycovidstory -d postgres:12.6-alpine` (this will match the DB URL string in `.env`).
1. Run `npx prisma migrate deploy` to apply migrations in `prisma/migrations`.
1. Run `npx prisma db seed --preview-feature` to see test data from `prisma/seed.ts`.
1. Run `npm run dev` to start the dev server.
   Open http://localhost:3000 in your browser to see the app.
1. Run `npm test` to run the test suite.
   This also gets run automatically on each Pull Request.

## Prisma Migrate

We use [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate) to manage the evolution of our database schema.
To work around a [current limitation](https://github.com/prisma/prisma/issues/7351) in Prisma, we exclude certain relation fields from the schema when running `prisma migrate`.

These fields are marked with a `//nomigrate` comment in the `schema.prisma` file.
Excluding them is handled automatically by the `prisma.sh` wrapper script for the prisma CLI.
For simplicity, you can always use `./prisma.sh` intead of `npx prisma` and the script will do the right thing.

## Learn More

This is a [Next.js](https://nextjs.org/) application bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and deployed on the [Vercel Platform](https://vercel.com/).
To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Next.js deployment documentation](https://nextjs.org/docs/deployment) - deployment on Vercel.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

[![https://vercel.com?utm_source=my-covid-story&utm_campaign=oss](./public/powered-by-vercel.svg)](https://vercel.com?utm_source=my-covid-story&utm_campaign=oss)

# 5 Features
# Implementation Highlights
## Filter:
The following changes were made to implement the filter feature:
Added ‘cities’ and ‘filtering_by’ to StoryFeedProps
Created story filter component in a new file.
Index.tsx file: Added a function to extract city names from the Props containing list of story objects.
And then inside the main function in index.tsx, if url has a filter parameter then reassign stories list to only contain filtered stories.
Invoked story filter component inside storyfeed component and fixed story feed arguments

# Upvote Count:
Inside story table, a field was added called ‘upvotecount’. The SELECT object in story.tsx file was also updated. 
Inside story detail, changes were made to the storyDetail component to contain button and label for the upvote count. 
Additionally, useState is imported and used to ensure that upvote button is disabled after being clicked.
Additionally a asynchronous function called upvote now is created. This function is called on click of the upvote button.
This function sends a request to the request handler function called ‘handle’ in votes.tsx file. This handler function calls a backend function in stories.tsx called ‘upvote’. Upvote function is responsible for updating the database.

# View count:
A viewcount field already existed inside story table in postgres database so there was no need to add another field.
Useeffect is used inside the storyDetail component to send a post request to the request handler function at '/api/stories/viewcount'. The handler function inside the viewcounts.tsx file called the increment_viewcount function in stories.tsx file. This function updates the database.

# Statistics Maps:
2 libraries/modules that were installed are:
•	canvas
•	csv-parser

A function was created (update_map) inside stories.tsx which reads csv files containing latlon data of postal codes. The function then loads blank map of Canada. It then loops over all postal codes in the database to draw circles in the map with latlon of that postal code as its centre. 
However this function is not called anywhere in the code yet. A call to this function should be added in the code, where the admins confirm/validate the story so that the map of Canada can be updated. 
To display this map, changes were made in storyFeed.tsx ‘feedheader’ component.




# Recommended articles:
A POST request to the server is made inside storyDetail component to the url: '/api/stories/recommend'.
The request handler function at this URL calls the backend function inside stories.tsx file called ‘get_recommends’.
This function queries the database for 3 stories with similar category as the story which is currently being displayed at the client. And send back these 3 story objects. 
A simple grid component is used inside storyDetail component to display the recommended stories.


