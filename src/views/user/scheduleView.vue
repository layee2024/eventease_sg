<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { SparklesIcon, CalendarIcon } from '@heroicons/vue/24/solid'
import { ArrowLeftIcon, ArrowPathIcon, ArrowDownTrayIcon, MapPinIcon, ShareIcon } from '@heroicons/vue/24/outline'
import { jsPDF } from 'jspdf';

const parsedIntro = ref('')
const parsedSchedule = ref([])
const router = useRouter()

function returnBack() {
    router.push("/planner")
}

function generateSchedulePDF() {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text('Your Perfect Day Schedule', 20, 20);

  // Intro
  const intro = parsedIntro.value || "Here's your personalized schedule:";
  doc.setFontSize(12);
  doc.text(intro, 20, 30);

  // Schedule items
  let yPosition = 40;
  parsedSchedule.value.forEach(item => {
    const textLine = `${item.start} - ${item.activity}`;
    const lines = doc.splitTextToSize(textLine, 170);
    doc.text(lines, 20, yPosition);
    yPosition += lines.length * 8;
  });

  return doc;
}


function saveSchedule() {
  const doc = generateSchedulePDF();
  doc.save('my-schedule.pdf');
}

function goMap() {
    router.push('/map')
}

async function shareFunc() {
  const doc = generateSchedulePDF();

  const pdfBlob = doc.output('blob');
  const file = new File([pdfBlob], 'my-schedule.pdf', { type: 'application/pdf' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: 'My AI-Powered Perfect Day ✨',
        text: parsedIntro.value || "Check out my AI-generated schedule!",
        files: [file]
      });
      console.log('✅ Shared successfully!');
    } catch (err) {
      console.error('❌ Error sharing:', err);
    }
  } else {
    doc.save('my-schedule.pdf');
    alert('Sharing is not supported in this browser. The PDF has been saved instead.');
  }
}


onMounted(() => {
    const saved = localStorage.getItem('aiSchedule')
    if (!saved) {
        return
    }

    const data = JSON.parse(saved)
    parsedIntro.value = data.intro
    parsedSchedule.value = data.schedule
})
</script>

<template>
    <section
        class="min-h-[93vh] py-12 px-6 md:px-12 xl:px-20 transition-colors duration-500 pb-32 bg-white dark:bg-[#121212]">

        <div class="flex gap-2 items-center mb-5 text-gray-500 cursor-pointer hover:text-blue-600 w-fit relative transition xl:ml-15"
            title="Go back" @click="returnBack">
            <ArrowLeftIcon class="h-4 transform group-hover:-translate-x-1 transition-transform duration-300 dark:text-white" />
            <span class="group-hover:decoration-solid dark:text-white">Back</span>
        </div>

        <div
            class="border border-gray-200 shadow-xl rounded-xl xl:w-[90%] p-6 min-h-[80vh] w-90% bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl mx-auto">
            <div class="flex flex-col relative">
                <div class="flex items-center">
                    <div class="relative">
                        <div class="flex items-center">
                            <SparklesIcon class="h-7 text-blue-600 mr-2" />
                            <h2
                                class="text-3xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                                Your perfect day
                            </h2>

                        </div>
                        <p
                            class="text-blue-600 font-bold italic bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
                            AI-powered personalised schedule just for you
                        </p>

                    </div>
                    <div class="absolute right-0">
                        <ShareIcon class="h-7 text-blue-600 cursor-pointer" @click="shareFunc"/>
                    </div>
                </div>
            </div>

            <div class="row">
                <div v-if="parsedSchedule.length" class="w-full">
                    <br>
                    <div v-if="parsedIntro"
                        class="text-lg text-gray-700 italic mb-4 rounded-md font-semibold">
                        {{ parsedIntro }}
                    </div>

                    <ul class="space-y-4 mt-4">
                        <li v-for="(item, index) in parsedSchedule" :key="item.start"
                            class="text-lg text-black bg-white/60 backdrop-blur-sm bg-gradient-to-r from-blue-100 to-purple-100 rounded-md p-4 shadow-sm border-l-4 border-blue-600 animate-fade-in-up"
                            :style="{ animationDelay: `${index * 100}ms` }">
                            <strong class="text-blue-700">{{ item.start }}</strong> - {{ item.activity }}
                        </li>
                    </ul>

                    <br>
                    <p class="text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md p-3 mt-4">
                        ⚠️ <strong>Note:</strong> This schedule is generated by AI and may contain inaccuracies.
                        Please double-check event times and details before making plans.
                    </p>
                </div>

                <div v-else class="flex items-center justify-center min-h-[70vh]">
                    <div class="text-center">
                        <div class="w-30 h-30 bg-black-0 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <CalendarIcon class="h-20 w-20 text-gray-300" />
                        </div>
                        <p class="text-gray-500 text-xl">
                            Your perfect day is just one form away!
                        </p>
                    </div>
                </div>
            </div>
            <div v-if="parsedSchedule.length > 0"
                class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
                <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div class="flex flex-col sm:flex-row gap-3">
    
                        <button @click="returnBack"
                            class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                            <ArrowPathIcon class="w-5 h-5" />
                            <span>Plan Another Day</span>
                        </button>
    
                        <div class="flex gap-3">
                            <button @click="saveSchedule"
                                class="flex-1 sm:flex-none bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors flex items-center justify-center gap-2">
                                <ArrowDownTrayIcon class="h-5" />
                                <span class="hidden sm:inline">Save</span>
                            </button>
    
                            <button @click="goMap"
                                class="flex-1 sm:flex-none bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors flex items-center justify-center gap-2">
                                <MapPinIcon class="h-5" />
                                <span>How to get there</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>


    </section>
</template>

<style scoped>
@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fade-in-up 0.5s ease-out forwards;
    opacity: 0;
}
</style>