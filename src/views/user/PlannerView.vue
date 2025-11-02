<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ClockIcon} from '@heroicons/vue/24/outline';
import { FireIcon, StarIcon, BoltIcon, SparklesIcon } from '@heroicons/vue/24/solid';
import { GoogleGenAI } from "@google/genai";
import { supabase } from "@/utils/supabase";
import { toast } from 'vue-sonner';

const router = useRouter();
const timeUp = ref('');
const endTime = ref('');
const interest = ref('');
const goal = ref('');
const energy = ref('low');
const isLoading = ref(false);
const validstart = ref(true);
const parsedIntro = ref(null);
const parsedSchedule = ref(null);

// Google GenAI setup
const api = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: api });

// Fetch events from Supabase
async function getCat() {
  const { data, error } = await supabase.from("events").select("*");
  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }
  return data;
}

function formatTimeTo12Hour(time24) {
  if (!time24) return '';
  let [hours, minutes] = time24.split(':').map(Number);
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  return `${hours}${ampm}`;
}

function isEndTimeValid(start, end) {
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)
  const startTotal = startH * 60 + startM
  const endTotal = endH * 60 + endM
  return endTotal > startTotal
}


function parseScheduleText(text) {
  const timeBlockRegex = /^(\d{1,2}\s*(?:am|pm)):\s*(.+)$/gmi;
  const schedule = [];
  let match;
  while ((match = timeBlockRegex.exec(text)) !== null) {
    schedule.push({ start: match[1].toLowerCase(), activity: match[2].trim() });
  }
  return { intro: "Here's your personalized schedule:", schedule };
}

function resetForm() {
  timeUp.value = '';
  endTime.value = '';
  interest.value = '';
  goal.value = '';
  energy.value = 'low';
  parsedSchedule.value = null;
  parsedIntro.value = null;
  validstart.value = true;
}

async function handleSubmit() {
  if (!timeUp.value || !endTime.value || !interest.value || !goal.value) {
    toast.error("Please fill in all fields before continuing.")
    return
  }

  if (!isEndTimeValid(timeUp.value, endTime.value)) {
    validstart.value = false
    toast.error("End time cannot be before start time.")
    return
  } else {
    validstart.value = true
  }

  isLoading.value = true
  parsedSchedule.value = null
  parsedIntro.value = null

  try {
    const dict = {
      interest: interest.value,
      goal: goal.value,
      timeUp: timeUp.value,
      endTime: endTime.value,
      energy: energy.value
    };

    const eventList = await getCat();

    const prompt = `
        You are hired to plan a day. The employer has provided the following information:
        - Interests: ${dict.interest}
        - Goal: ${dict.goal}
        - Activity Start Time: ${formatTimeTo12Hour(dict.timeUp)}
        - Activity End Time: ${formatTimeTo12Hour(dict.endTime)}
        - Energy level: ${dict.energy}
        - List of events happening around Singapore (ISO 8601 format): ${JSON.stringify(eventList, null, 2)}

        Create a personalized, achievable schedule for today based on this information.
        Guidelines:
        - Start first activity exactly at the user's Activity Start Time (${formatTimeTo12Hour(dict.timeUp)}).
        - First activity must not be wake up or morning routine.
        - Do not use any Markdowns.
        - Break the schedule into clear time blocks (10am, 11am, etc.).
        - Output format: "10am: Activity description".
        - Avoid overlapping with user's scheduled events.
        - Must use events thats from the suggested list of events.
        - If user's interest and goals do not align with any of the events, suggest the closest activtiy which can help achieve their goal.
        - Include short breaks or meal times.
        - Align with user's energy.
        - Schedule must end no later than ${formatTimeTo12Hour(dict.endTime)}.

        Output example:
        8am: Morning yoga at the park
        9am: Coffee break at a nearby cafe
        10am: Visit art exhibition
        `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });

    const resultText = result.text;
    const resultObject = parseScheduleText(resultText);
    parsedIntro.value = resultObject.intro;
    parsedSchedule.value = resultObject.schedule;

    localStorage.setItem('aiSchedule', JSON.stringify({ intro: parsedIntro.value, schedule: parsedSchedule.value }));
    router.push('/ScheduleView')

  } catch (error) {
    console.error("Error generating schedule:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => getCat());
</script>

<template>
  <section class="h-[93vh] min-h-max mb-48 xl:mb-24 bg-white dark:bg-[#121212] py-12 px-6 md:px-12 xl:px-20">
    <!-- Header -->
    <div class="text-center mb-10">
      <div class="flex justify-center items-center gap-2">
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">Planner</h1>
        <SparklesIcon class="h-7 text-blue-600" />
      </div>
      <p class="text-lg text-gray-400 mt-2">
        Let AI help you create a personalised schedule that matches your goals, interests, and energy level
      </p> 
    </div>

  
    <div class="flex flex-col xl:flex-row gap-6">
   
      <div class="shadow-xl border rounded-md xl:w-[70%] xl:justify-self-center p-5 xl:h-[80vh] mx-auto w-[100%] h-[80vh]">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <h2 class="text-2xl font-extrabold dark:text-[#E0E0E0]">Tell us about your day</h2>
          </div>
          <p class="font-bold italic bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
            Share your preferences and we'll create the perfect schedule for you
          </p>
        </div>
        <form @submit.prevent="handleSubmit" class="mt-4 flex flex-col gap-6">
          <!-- Start & End Time -->
          <div class="flex gap-6">
            <div class="w-1/2">
              <label class="flex items-center gap-2 text-xl font-bold mb-1 dark:text-[#E0E0E0]"><ClockIcon class="h-6 dark:text-[#E0E0E0]" /> Activity Start Time</label>
              <input type="time" v-model="timeUp" required class="w-full py-2 px-3 border rounded shadow focus:ring-2 focus:ring-blue-500 dark:text-[#E0E0E0]" />
            </div>
            <div class="w-1/2">
              <label class="flex items-center gap-2 text-xl font-bold mb-1 dark:text-[#E0E0E0]"><ClockIcon class="h-6 dark:text-[#E0E0E0]" /> Activity End Time</label>
              <input type="time" v-model="endTime" required class="w-full py-2 px-3 border rounded shadow focus:ring-2 focus:ring-blue-500 dark:text-[#E0E0E0]" />
            </div>
          </div>

          <!-- Interest -->
          <div>
            <label class="flex items-center gap-2 text-xl font-bold mb-1 dark:text-[#E0E0E0]"><FireIcon class="h-5 text-orange-600" /> Interest & Hobbies</label>
            <textarea v-model="interest" rows="4" required placeholder="Enter your interests..." class="min-h-24 w-full p-2 border rounded shadow focus:ring-2 focus:ring-blue-500 dark:text-[#E0E0E0]"></textarea>
          </div>

          <!-- Goals -->
          <div>
            <label class="flex items-center gap-2 text-xl font-bold mb-1 dark:text-[#E0E0E0]"><StarIcon class="h-5 text-yellow-400" /> Goals</label>
            <textarea v-model="goal" rows="4" required placeholder="Enter your goals..." class="min-h-24 w-full p-2 border rounded shadow focus:ring-2 focus:ring-blue-500 dark:text-[#E0E0E0]"></textarea>
          </div>

          <!-- Energy -->
          <div>
            <label class="flex items-center gap-2 text-xl font-bold mb-1 dark:text-[#E0E0E0]"><BoltIcon class="h-5 text-yellow-400" /> Energy Level</label>
            <select v-model="energy" class="w-full p-3 border rounded shadow focus:ring-2 focus:ring-blue-500 dark:text-[#E0E0E0]">
              <option value="low">Low - slow, relaxing day to unwind and recharge</option>
              <option value="medium">Medium - balanced day with work & leisure</option>
              <option value="high">High - high-energy day to conquer goals!</option>
            </select>
          </div>

          <div class="flex flex-col items-center gap-3">
            <button type="submit" :disabled="isLoading" class="w-full h-12 bg-black dark:bg-[#E0E0E0] text-white dark:text-black rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
              <SparklesIcon class="h-6 w-6" /> {{ isLoading ? 'Generating...' : 'Plan my day!' }}
            </button>
            <button type="button" @click="resetForm" class="underline text-gray-400 hover:text-gray-600">Reset</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
  opacity: 0;
}
</style>
