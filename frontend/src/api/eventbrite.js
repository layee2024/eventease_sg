
export async function fetchEvents() {
    const response = await fetch(
      "https://www.eventbriteapi.com/v3/events/search/?location.address=Singapore",
      {
        headers: {
          Authorization: "TV36OQ5SHDTUFEIFVBSL"
        }
      }
    );
  
    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }
  
    return await response.json();
  }
  


/*
Eventbrite API call by location is deprecated,
We collected all venues in Singapore and got their IDs
We then searched each venue one by one


*/