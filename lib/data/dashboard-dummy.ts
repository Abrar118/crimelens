// Sample data for the bar chart
const chartData = [
   { month: "Jan", CSAT: 75, FAR: 62.7, NPS: 50 },
   { month: "Feb", CSAT: 60, FAR: 6.3, NPS: 40 },
   { month: "Mar", CSAT: 90, FAR: 62.7, NPS: 70 },
   { month: "Apr", CSAT: 100, FAR: 6.3, NPS: 80 },
   { month: "May", CSAT: 64, FAR: 62.7, NPS: 55 },
   { month: "Jun", CSAT: 96, FAR: 62.7, NPS: 75 },
   { month: "Jul", CSAT: 36, FAR: 6.2, NPS: 30 },
   { month: "Aug", CSAT: 84, FAR: 62.7, NPS: 65 },
   { month: "Sep", CSAT: 80, FAR: 7.7, NPS: 60 },
   { month: "Oct", CSAT: 76, FAR: 62.7, NPS: 58 },
   { month: "Nov", CSAT: 60, FAR: 12.7, NPS: 40 },
   { month: "Dec", CSAT: 75, FAR: 12.7, NPS: 50 },
 ];

 const npsData = [
  { date: "Aug", nps: 74.14, ces: 2.97 },
  { date: "Sep", nps: 66.67, ces: 3.29 },
  { date: "Oct", nps: 58.14, ces: 3.35 },
  { date: "Nov", nps: 62.26, ces: 2.91 },
  { date: "Dec", nps: 56.90, ces: 3.17 },
  { date: "Jan", nps: 67.45, ces: 2.91 },
]

const satisfactionData = [
  { date: "Aug 2024", csat: 83.81, adoption: 89.66 },
  { date: "Sep 2024", csat: 83.93, adoption: 88.89 },
  { date: "Oct 2024", csat: 83.33, adoption: 72.09 },
  { date: "Nov 2024", csat: 84.91, adoption: 94.91 },
  { date: "Dec 2024", csat: 79.41, adoption: 81.26 },
  { date: "Jan 2025", csat: 81.26, adoption: 93.02 },
]
 
 const recentResonses = [
   {
      name: "Ashikur Rahman",
      email: "ashikur.rahman@email.com",
      surveyName: "Customer Satisfaction Survey",
    },
    {
      name: "Tanvir Ahmed",
      email: "tanvir.ahmed@email.com",
      surveyName: "Customer Feedback Survey",
    },
    {
      name: "Nusrat Jahan",
      email: "nusrat.jahan@email.com",
      surveyName: "Customer Feedback Survey",
    },
    {
      name: "Mahmudul Hasan",
      email: "mahmudul.hasan@email.com",
      surveyName: "Customer Satisfaction Survey",
    },
    {
      name: "Farhana Islam",
      email: "farhana.islam@email.com",
      surveyName: "Customer Feedback Survey",
    },
    {
      name: "Rakibul Islam",
      email: "rakibul.islam@gmail.com",
      surveyName: "Customer Retention Survey",
    },
    {
      name: "Sumaiya Akter",
      email: "sumaiya.akter@gmail.com",
      surveyName: "Customer Satisfaction Survey",
    },
 ];

 
 export { chartData, recentResonses, npsData, satisfactionData };