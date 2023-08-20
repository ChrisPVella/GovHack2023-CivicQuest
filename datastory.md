# CivicQuest Data Story


## Overview

We developed CivicQuest using OpenAI's advanced chat completion API which utilises cutting-edge deep learning techniques. The chatbot interface allows users to describe their interests and get personalised recommendations of events, parks, attractions, restaurants, and local places to visit.

Under the hood, the chatbot accesses curated datasets of Brisbane and South Australian points of interest to generate insightful recommendations. We optimised the data into a searchable JSON format and implemented fuzzy search for fast and accurate results. Now users can get suggestions and a full itinerary with detailed instructions within seconds.

The chatbot has been trained with a diverse range of conversational prompts to sound natural. Once it gathers enough information about the user's preferences, it calls a function to submit a structured travel itinerary summarising the key destinations.

By combining OpenAI's powerful language model with access to rich local knowledge graphs, CivicQuest can create amazingly customised urban quests. Gamification features like collecting points for checking in and completing location-based challenges make sightseeing exciting.

As a serverless application hosted on Cloudflare's edge network, CivicQuest offers low latency and a smooth user experience. We employed the latest data protection standards to ensure chat histories remain private and encrypted, even if this is just for the GovHack event.


## Datasets

Overall, we heavily utilised the Australian Tourism Data Warehouse (ATDW) for wide and detailled set of data that provided facilities, attractons, transportation, events and more. 

CivicQuest was also trained in greater detail on Brisbane and South Australian datasets to be able to provide refined recommendations, as demonstrated in the presentation. 

The underlying data for the app and website is sourced from Google Maps API and Bing Maps API, tied into an Azure Maps Geospatial Mapping API service. Location specific, open data sources were used to augment and provide greater detail for trained locations.