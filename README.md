# Year Zone Frontend

This is the frontend React app for the Year Zone project. It allows users to visualize the time difference between two cities over the course of a year. 

The frontend uses [Create React App](https://create-react-app.dev/) and is hosted on Netlify at https://main--strong-capybara-cc1a4c.netlify.app/.

It interfaces with the [Year Zone Backend API](https://github.com/dpletzke/year-zone-be) hosted on Render at https://year-zone-be.onrender.com.

## Features

- Select two cities using Google Places autocomplete
- See time difference between cities visualized on a calendar view 
- Calendar colors indicate time offsets with legend
- Swap cities button

## Architecture

The frontend is built with:

- React
- TypeScript
- Material UI
- Emotion for styling
- React Yearly Calendar
- Moment Timezone

It calls the Year Zone Backend API endpoints to get timezone data for selected cities. 

The main `App` component handles state and data flow. `LocationSelector`, `CalendarContainer`, and other presentational components display the UI.

## Running Locally

To run the app locally:

1. Clone the repo
2. Run `npm install`
3. Create a `.env` file with a Google Maps API key  
4. Run `npm start`
5. Open http://localhost:3000

## Deployment

The frontend is deployed on Netlify, configured to automatically deploy the `main` branch.

Let me know if any sections need to be expanded or clarified!
