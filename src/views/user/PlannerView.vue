<script setup>
import { ClockIcon, SparklesIcon, BoltIcon } from '@heroicons/vue/24/outline';
import { CalendarIcon, FireIcon, StarIcon } from '@heroicons/vue/24/solid';
import { GoogleGenAI } from "@google/genai";
import { supabase } from "@/utils/supabase";
import { ref, onMounted } from 'vue';


const showForm = ref(false);

const timeUp = ref(null);
const interest = ref(null);
const goal = ref(null);
const energy = ref('low');

const isLoading = ref(false);
const parsedIntro = ref(null);
const parsedSchedule = ref(null);

const api = import.meta.env.VITE_GEMINI_API_KEY
const ai = new GoogleGenAI({
  apiKey: api
});

async function getCat() {
  const { data, error } = await supabase.from("events").select("*")
  if (error) {
    console.error("Error fetching events:", error)
    return []
  }

  // console.log(data)
  return data
}

async function handleSubmit() {
  isLoading.value = true;

  try {
    const dict = {
      interest: interest.value,
      goal: goal.value,
      timeUp: timeUp.value,
      energy: energy.value
    };

    console.log("User input:", dict);

    // Get events from Supabase
    const eventList = await getCat();

    // // Create a prompt using user data and events
    const prompt = `
      You are a productivity coach.

      A user has provided the following information:
      - Interests: ${dict.interest}
      - Goal: ${dict.goal}
      - Wake-up time: ${dict.timeUp}
      - Energy level: ${dict.energy}
      - List of events happening around Singapore (in ISO 8601 format): ${JSON.stringify(eventList, null, 2)}

      Create a personalized, achievable schedule for today based on this information.

      Guidelines:
      - Break the schedule into clear time blocks (e.g., 10:00 AM - 10:30 AM). Important!
      - Avoid overlapping with the user's scheduled events.
      - Make sure to suggest users events that are in the list of events happening aroung Singapore.
      - Make sure to give the start time and start date (parsed) at which the event is happening.
      - Make sure that all the events that are suggested fall on the same date, if it does not fall on the same date, it is ok to suggest other activites that do not align with the hobbies and interest(very important)
      - Align suggestions with the user's energy level.
      - Include short breaks if needed.
      - Include meal times if needed.
      - Focus on helping the user progress toward their goal in an enjoyable and sustainable way.
      - If no scheduled events match the user's interests, suggest alternative activities aligned with their goal and energy, making sure the events are still from the list of events available.
      - Output format: plain text schedule, one line per time block.
      `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
      }
    });
    console.log(result.text);

    // const result = `
    //     Here is a productivity-focused schedule designed to help you make an impact in the environment, keeping your 10 am wake-up time and high energy levels in mind:

    //     10:00 AM - 10:30 AM: Wake up, hydrate, and light stretching to energize for the day.
    //     10:30 AM - 11:30 AM: Breakfast and review today's schedule and environmental goals.
    //     11:30 AM - 12:00 PM: Travel to Pasir Ris Beach.
    //     12:00 PM - 2:00 PM: Volunteer at the Community Beach Cleanup (Event ID: 3777455b-f9e0-47fd-b3a1-9e614b76e787). This aligns perfectly with your interest in volunteer work and goal of helping the environment. Your high energy will be well-utilized here.
    //     2:00 PM - 2:30 PM: Travel to a nearby lunch spot.
    //     2:30 PM - 3:30 PM: Lunch and a short break to recharge.
    //     3:30 PM - 5:00 PM: Attend the Eco Action Forum (Event ID: 2b57aa85-b92d-486d-b1ef-45477fcceb43). This event offers valuable insights and workshops on climate solutions and green innovation, further supporting your environmental goals.
    //     5:00 PM - 6:00 PM: Travel back home.
    //     6:00 PM - 7:00 PM: Relax and reflect on the day's activities. Consider journaling about your experience at the cleanup and what you learned at the forum.
    //     7:00 PM - 8:00 PM: Dinner.
    //     8:00 PM onwards: Free time. You could use this to research local environmental organizations, plan future volunteer opportunities, or engage in activities that help you unwind.
    //   `;

    const resultText = result.text;
    console.log(parseScheduleText(resultText));

    const resultObject = parseScheduleText(resultText);
    parsedIntro.value = resultObject.intro;
    parsedSchedule.value = resultObject.schedule;

  }
  catch (error) {
    console.log("Error generating schedule:", error);
  } finally {
    isLoading.value = false;
  }
}

function parseScheduleText(text) {
  const timeBlockRegex = /^(\d{1,2}:\d{2}\s*[APMapm]{2})\s*(?:-\s*(\d{1,2}:\d{2}\s*[APMapm]{2})|onwards):\s*([\s\S]*?)(?=^\d{1,2}:\d{2}\s*[APMapm]{2}(?:\s*-\s*\d{1,2}:\d{2}\s*[APMapm]{2}|onwards):|\Z)/gmi;
  const schedule = [];
  let match;

  while ((match = timeBlockRegex.exec(text)) !== null) {
    schedule.push({
      start: match[1].toUpperCase().replace(/\s+/, ''),
      end: match[2].toUpperCase().replace(/\s+/, ''),
      activity: match[3].trim()
    });
  }

  const firstTimeIndex = text.search(timeBlockRegex);
  const intro = text.slice(0, firstTimeIndex).trim();

  return { intro, schedule };
}

onMounted(() => {
  getCat()
})

</script>

<template>
  <section class="min-h-screen bg-white py-12 px-6 md:px-12 xl:px-20">
    <!-- Header -->
    <div class="container">

      <!-- header -->
      <div class="row justify-self-center">
        <div class="bg-gray-100 rounded-full p-2">
          <SparklesIcon class="h-9"></SparklesIcon>
        </div>
      </div>

      <div class="text-center mb-10">
      <h1 class="text-3xl font-extrabold text-gray-900">Plan your perfect day</h1>
      <p class="text-lg text-gray-600 mt-2">
        Let AI help you create a personalised schedule that matches
          your goals, interest and energy level
      </p>
    </div>

      
      <!-- header end -->





    </div>
    <br><br>
    <div class="container flex flex-col xl:flex-row gap-6">

      <div class="shadow-lg border rounded-md xl:w-full p-5 h-fit">
        <div class="flex items-center">
          <SparklesIcon class="h-8 mr-2"> </SparklesIcon>
          <h2 class="text-3xl text-black font-semibold">Tell us about your day</h2>
        </div>
        <h4 class="text-gray-400 italic">Share your preference and we'll create the perfect schedule for you</h4>

        <br>

        <form @submit.prevent="handleSubmit">
          <div class="row">

            <div class="flex items-center pb-2">
              <CalendarIcon class="h-6 mr-1 text-gray-600" stroke-width="2.5"></CalendarIcon>
              <label for="timeUp" class="text-xl text-black font-bold dark:bg-gray-700">Wake-up Time</label>
            </div>

            <div class="relative w-full">
              <input type="text" placeholder="Enter time" v-model="timeUp" required
                class="w-full py-2 pr-10 pl-3 rounded border text-black shadow-sm text-lg" />

              <div class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" @click="showForm = !showForm">
                <ClockIcon class="w-5 h-5 text-gray-600" />
              </div>
            </div>

          </div>

          <br>

          <div class="row">
            <div class="flex items-center pb-2">
              <FireIcon class="h-5 mr-1 text-gray-600"></FireIcon>
              <label for="interest" class="text-xl text-black font-bold">Interest & Hobbies</label>
            </div>

            <div class="w-full">
              <textarea v-model="interest" name="interest" id="interesr" required
                class="border shadow-sm rounded-sm w-[100%] p-2 text-lg" rows="4"
                placeholder="Enter interests & hobbies here"></textarea>
            </div>
          </div>

          <br>

          <div class="row">
            <div class="flex items-center pb-2">
              <StarIcon class="h-5 mr-1 text-gray-600"></StarIcon>
              <label for="interest" class="text-xl text-black font-bold">Goals</label>
            </div>

            <div class="w-full">
              <textarea name="interest" v-model="goal" id="interest" required
                class="border shadow-sm rounded-sm w-[100%] p-2 text-lg" rows="4"
                placeholder="Enter interests & hobbies here"></textarea>
            </div>
          </div>

          <br>

          <div class="row">
            <div class="flex items-center pb-2">
              <BoltIcon class="h-5 mr-1 text-gray-600"></BoltIcon>
              <label for="interest" class="text-xl text-black font-bold dark:bg-gray-700 dark:border-gray-600">Energy
                Level</label>
            </div>

            <select id="countries" v-model="energy" class="border shadow-sm text-lg rounded-sm block w-full p-3">
              <option value="low">Low - slow, relaxing day to unwind and recharge</option>
              <option value="medium">Medium - A balanced day with a mix of work and leisure</option>
              <option value="high">High - A high-energy day, ready to conquer your goals!</option>
            </select>

          </div>
          <br><br>

          <div class="row flex flex-col items-center">
            <button type="submit"
              class="flex items-center gap2 bg-black rounded-lg border text-white h-[50px] w-full text-lg font-semibold gap-2 justify-center">
              <SparklesIcon class="h-6 w-6"></SparklesIcon> Plan my day!
            </button>
            <button type="reset" class="underline text-gray-400 text-lg pt-3">
              Reset
            </button>
          </div>

        </form>
      </div>

      <br> <br>

      <div class="border shadow-lg rounded-md xl:w-[100%] p-8 h-fit w-full">
        <div class="row">
          <div class="col">
            <h2 class="text-2xl font-semibold pb-2"> Your Perfect Day</h2>
            <p class="text-xl text-gray-400 italic"> AI-powered personalised schedule just for you</p>
          </div>

        </div>

        <!-- show loading spinner -->
        <div class="row">
          <div v-if="isLoading" class="w-full flex flex-col items-center py-10">
            <svg class="animate-spin h-10 w-10 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p class="text-xl text-gray-400">Planning your day...</p>
          </div>

          <div v-else-if="parsedSchedule && parsedSchedule.length" class="w-full">
            <br>
            <div v-if="parsedIntro" class="text-xl text-gray-700 italic mb-4"> {{ parsedIntro }}</div>
            <ul class="space-y-4 mt-4">
              <li v-for="item in parsedSchedule" :key="item.start"
                class="text-lg text-black bg-gray-100 rounded-md p-4 shadow-sm">
                <strong>{{ item.start }} - {{ item.end }}</strong>: {{ item.activity }}
              </li>
            </ul>

            <br>
            <p class="text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md p-3 mt-4">
                  ⚠️ <strong>Note:</strong> This schedule is generated by AI and may contain inaccuracies or timing conflicts. Please double-check event times and details before making plans.
            </p>
          </div>

          <div v-else class="col text-center py-10">
            <calendar-icon class="h-20 w-20 text-gray-200 mx-auto" />
            <p class="text-gray-400 text-xl mt-4">Your perfect day is just one form away!</p>
          </div>
        </div>

        
      </div>


    </div>


  </section>
</template>

<style scoped></style>
