import { useState } from "react"

const spots = [
  { id: "1", name: "Bercy", isVerified: true },
  { id: "2", name: "Belleville", isVerified: false },
  { id: "3", name: "Choisy", isVerified: true },
  { id: "4", name: "Chaumont", isVerified: false },
];

spots.map((spots) => {
  <div>
    <h3>{spots.name}</h3>
  </div>
})

  const [selectionnedSpot, setSelectionnedSpot] = useState();

onclcik= {setSelectionnedSpot}

selectionnedSpot = 
