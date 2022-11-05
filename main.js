const continent = ["Africa", "America", "Asia", "Europe", "Oceania"];
let world = {};
const AfricaBtn = document.querySelector('.africa');
const AmericaBtn = document.querySelector('.america');
const AsiaBtn = document.querySelector('.asia');
const EuropeBtn = document.querySelector('.europe');
const OceaniaBtn = document.querySelector('.oceania');
const btnsContainer = document.querySelector('.continentBtnContainer');
const citeisBtnsContainer = document.querySelector('#citeisBtnsContainer');
const cityButton = document.querySelector('#citeisBtnsContainer');
const header = document.querySelector('.header');

const fetchData = async (url) => {
   try {
     const response = await fetch(url);
     const data = await response.json();
     return data;
   } catch (error) {
     console.log(error);
   }
};

const getCountriesData = async () => {
   for (let i = 0; i < continent.length; i++) {
      const continentName = continent[i];
      const currentRegion = await fetchData(`https://restcountries.com/v3.1/region/${continent[i]}`);
      Object.assign(world, { [continentName]: [] })
      for (let j = 0; j < currentRegion.length; j++) {
         if(currentRegion[j].name.common){
         }
         const countryCommonName = currentRegion[j].name.common;
         const countryOfficialName = currentRegion[j].name.official;
         const countryPopulation = currentRegion[j].population;
         const flag = currentRegion[j].flags;
         const neighbors = (currentRegion[j].borders !==undefined ?currentRegion[j].borders.length :0);
         fillObject(world[continentName],countryOfficialName,countryCommonName,countryPopulation,neighbors,flag,continentName);
     }
   }
};

function fillObject(arr,Offname,CommonName,pop,neighbors,flag,continent){
   arr.push({
      CommonName: CommonName,
      Officialname: Offname,
      population: pop,
      flag: flag,
      neighbors: neighbors,
      continent:continent
   })
}
const fetchCityDataFromCountries = async (country) => {
   try{
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/population/cities/filter', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            'limit': 35,
            'order': "asc",
            'orderBy': "name",
            'country': country,
         }),
      });
      const data = await res.json();
      return data ;
   }
   catch(err){
      console.log(err);
   }
};

async function checkCommonOrOfficial(obj){
   const data = await fetchCityDataFromCountries(obj.CommonName);
   if(data.error){
      const response = await fetchCityDataFromCountries(obj.Officialname);
      return response;
   }
   return data;
}

function createAndAppendCanvas(){
   const div = document.querySelector('#ContainerChart');
   div.replaceChildren('');
   const canvas = document.createElement('canvas');
   canvas.id = 'myChart';
   div.appendChild(canvas);
}

Chart.defaults.color = '#0af574e7';

 function createChart(labels,newData){
   createAndAppendCanvas();
   const ctx = document.getElementById('myChart');
   const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
         labels: labels,
         datasets: [{
            label: 'population',
            data: newData,
            backgroundColor: '#0cfa0ce7',
            borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
            borderWidth: 1,
              color:"rgba(255, 159, 64, 1)",
         }]
      },
      options: {
        animations: {
            tension: {
              duration: 1000,
              easing: 'linear',
              from: 1,
              to: 0,
              loop: true
            }
          },
           plugins: { 
            legend: {
              labels: {
                color: "#17c3b2",  
            
                font: {
                  size: 20 
                }
              }
            }
          },
          
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: ["#80ed99","#c7f9cc","#57cc99","#ff9770","#a99985"],
                font: {
                  size: 20, 
                },
              },
              
            },
            x:{
              ticks: {
                color: ["#80ed99","#c7f9cc","#57cc99","#ff9770","#a99985"], 
              
                font: {
                  size: 20, 
                },
              },
            }
          },
        },
      })


    }
  

function bulidCiteisButtons(arr){
   citeisBtnsContainer.replaceChildren('');
   arr.forEach((element,idx) => {
      const button = document.createElement('button');
      button.classList='citeisBtns city';
      button.setAttribute('data-id',idx);
      button.setAttribute('data-country',element.CommonName);
      button.setAttribute('data-continent',element.continent);
      button.textContent = element.CommonName;
      citeisBtnsContainer.appendChild(button);
   });
}

async function handleCiteisEvents(event){
   const btn = event.target.getAttribute('data-id');
   const btnContinent = event.target.getAttribute('data-continent');
   const res = await checkCommonOrOfficial(world[btnContinent][btn]);
   if(res.data){
      header.textContent='World Population'
      const labels = res.data.map((el)=>{
         return  el.city });
      const population = res.data.map((el)=>{
         return el.populationCounts[0].value });
      createChart(labels,population);
      return;
   }
   header.textContent=('no data found!!')
}

function handleEvents(event){
   header.textContent='World Population'
   const labels = world[event.target.textContent].map(el => el.CommonName);
   const population = world[event.target.textContent].map(el => el.population );
   createChart(labels,population);
   bulidCiteisButtons(world[event.target.textContent]);
}

function start(){
   getCountriesData();
   btnsContainer.addEventListener('click', handleEvents);
   cityButton.addEventListener('click', handleCiteisEvents);
}

start();