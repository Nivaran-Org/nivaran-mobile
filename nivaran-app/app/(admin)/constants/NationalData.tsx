// app/constants/NationalData.ts
export const NATIONAL_STRUCTURE: any = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari"],
  "Arunachal Pradesh": ["Tawang", "West Kameng"],
  "Assam": ["Guwahati", "Dibrugarh"],
  "Bihar": ["Patna", "Gaya"],
  "Chhattisgarh": ["Raipur", "Bhilai"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Surat"],
  "Haryana": ["Gurugram", "Faridabad"],
  "Himachal Pradesh": ["Shimla", "Manali"],
  "Jharkhand": ["Ranchi", "Jamshedpur"],
  "Karnataka": ["Bengaluru", "Mysuru"],
  "Kerala": ["Kochi", "Thiruvananthapuram"],
  "Madhya Pradesh": ["Bhopal", "Indore"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
  "Manipur": ["Imphal"],
  "Meghalaya": ["Shillong"],
  "Mizoram": ["Aizawl"],
  "Nagaland": ["Kohima"],
  "Odisha": ["Bhubaneswar"],
  "Punjab": ["Jalandhar", "Amritsar", "Ludhiana", "Patiala"],
  "Rajasthan": ["Jaipur", "Jodhpur"],
  "Sikkim": ["Gangtok"],
  "Tamil Nadu": ["Chennai", "Coimbatore"],
  "Telangana": ["Hyderabad"],
  "Tripura": ["Agartala"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi"],
  "Uttarakhand": ["Dehradun"],
  "West Bengal": ["Kolkata", "Darjeeling"]
};

// Mock function to simulate user-provided case data
export const getDistrictCases = (district: string) => [
  {
    id: 'GRV-9901',
    title: "Main Road Pothole", // User Provided
    description: "Huge pothole near the central market causing traffic.",
    userImage: "https://images.unsplash.com/photo-1596395819057-e37f55a85171?q=80&w=500",
    adminImage: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=500",
    status: "Resolved",
    userScore: 4,
    adminScore: 5,
    submittedBy: "Rajesh Kumar"
  },
  {
    id: 'GRV-9902',
    title: "Street Light Not Working",
    description: "The entire block is dark since Monday.",
    userImage: "https://images.unsplash.com/photo-1516146483820-8919379840b1?q=80&w=500",
    adminImage: null,
    status: "Pending",
    userScore: 0,
    adminScore: 0,
    submittedBy: "Anita Singh"
  }
];