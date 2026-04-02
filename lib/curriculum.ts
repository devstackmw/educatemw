export interface Topic {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  topics: {
    [key: string]: Topic[]; // key is form (e.g., "Form 1")
  };
}

export const CURRICULUM: Subject[] = [
  {
    id: "math",
    name: "Mathematics",
    topics: {
      "Form 1": [
        { id: "m1_1", name: "Numbers and Operations" },
        { id: "m1_2", name: "Algebraic Expressions" },
        { id: "m1_3", name: "Geometry: Lines and Angles" },
        { id: "m1_4", name: "Data Handling" }
      ],
      "Form 2": [
        { id: "m2_1", name: "Ratio and Proportion" },
        { id: "m2_2", name: "Linear Equations" },
        { id: "m2_3", name: "Pythagoras Theorem" },
        { id: "m2_4", name: "Probability" }
      ],
      "Form 3": [
        { id: "m3_1", name: "Quadratic Equations" },
        { id: "m3_2", name: "Trigonometry" },
        { id: "m3_3", name: "Circle Geometry" },
        { id: "m3_4", name: "Matrices" }
      ],
      "Form 4": [
        { id: "m4_1", name: "Calculus: Differentiation" },
        { id: "m4_2", name: "Vectors" },
        { id: "m4_3", name: "Statistics: Measures of Dispersion" },
        { id: "m4_4", name: "Transformation Geometry" }
      ]
    }
  },
  {
    id: "english",
    name: "English",
    topics: {
      "Form 1": [
        { id: "e1_1", name: "Parts of Speech" },
        { id: "e1_2", name: "Sentence Structure" },
        { id: "e1_3", name: "Reading Comprehension" }
      ],
      "Form 2": [
        { id: "e2_1", name: "Tenses and Aspects" },
        { id: "e2_2", name: "Direct and Indirect Speech" },
        { id: "e2_3", name: "Summary Writing" }
      ],
      "Form 3": [
        { id: "e3_1", name: "Active and Passive Voice" },
        { id: "e3_2", name: "Conditional Sentences" },
        { id: "e3_3", name: "Literary Devices" }
      ],
      "Form 4": [
        { id: "e4_1", name: "Advanced Composition" },
        { id: "e4_2", name: "Critical Analysis of Texts" },
        { id: "e4_3", name: "Exam Techniques for MANEB" }
      ]
    }
  },
  {
    id: "biology",
    name: "Biology",
    topics: {
      "Form 1": [
        { id: "b1_1", name: "Introduction to Biology" },
        { id: "b1_2", name: "Cell Structure and Function" },
        { id: "b1_3", name: "Classification of Living Things" }
      ],
      "Form 2": [
        { id: "b2_1", name: "Nutrition in Plants and Animals" },
        { id: "b2_2", name: "Transport Systems" },
        { id: "b2_3", name: "Respiration" }
      ],
      "Form 3": [
        { id: "b3_1", name: "Excretion and Homeostasis" },
        { id: "b3_2", name: "Coordination and Response" },
        { id: "b3_3", name: "Reproduction" }
      ],
      "Form 4": [
        { id: "b4_1", name: "Genetics and Evolution" },
        { id: "b4_2", name: "Ecology and Conservation" },
        { id: "b4_3", name: "Health and Diseases" }
      ]
    }
  },
  {
    id: "physical_science",
    name: "Physical Science",
    topics: {
      "Form 1": [
        { id: "ps1_1", name: "Matter and its Properties" },
        { id: "ps1_2", name: "Measurements in Science" },
        { id: "ps1_3", name: "Force and Motion" }
      ],
      "Form 2": [
        { id: "ps2_1", name: "Energy Sources and Forms" },
        { id: "ps2_2", name: "Atomic Structure" },
        { id: "ps2_3", name: "Chemical Bonding" }
      ],
      "Form 3": [
        { id: "ps3_1", name: "Electricity and Magnetism" },
        { id: "ps3_2", name: "Acids, Bases and Salts" },
        { id: "ps3_3", name: "Organic Chemistry" }
      ],
      "Form 4": [
        { id: "ps4_1", name: "Nuclear Physics" },
        { id: "ps4_2", name: "Electrolysis" },
        { id: "ps4_3", name: "Waves and Light" }
      ]
    }
  },
  {
    id: "geography",
    name: "Geography",
    topics: {
      "Form 1": [
        { id: "g1_1", name: "Introduction to Geography" },
        { id: "g1_2", name: "The Solar System" },
        { id: "g1_3", name: "Map Reading Skills" }
      ],
      "Form 2": [
        { id: "g2_1", name: "Weather and Climate" },
        { id: "g2_2", name: "Internal Land Forming Processes" },
        { id: "g2_3", name: "Population Studies" }
      ],
      "Form 3": [
        { id: "g3_1", name: "External Land Forming Processes" },
        { id: "g3_2", name: "Agriculture in Malawi" },
        { id: "g3_3", name: "Mining and Industry" }
      ],
      "Form 4": [
        { id: "g4_1", name: "Environmental Management" },
        { id: "g4_2", name: "Regional Geography: SADC" },
        { id: "g4_3", name: "Tourism in Malawi" }
      ]
    }
  },
  {
    id: "history",
    name: "History",
    topics: {
      "Form 1": [
        { id: "h1_1", name: "Introduction to History" },
        { id: "h1_2", name: "Early Man and Civilizations" },
        { id: "h1_3", name: "Migration into Malawi" }
      ],
      "Form 2": [
        { id: "h2_1", name: "The Slave Trade" },
        { id: "h2_2", name: "European Exploration" },
        { id: "h2_3", name: "Christian Missions in Malawi" }
      ],
      "Form 3": [
        { id: "h3_1", name: "Colonial Rule in Malawi" },
        { id: "h3_2", name: "The Rise of Nationalism" },
        { id: "h3_3", name: "World War I and II" }
      ],
      "Form 4": [
        { id: "h4_1", name: "Independence and Post-Independence" },
        { id: "h4_2", name: "The Cold War" },
        { id: "h4_3", name: "International Organizations: UN, AU" }
      ]
    }
  },
  {
    id: "social_studies",
    name: "Social Studies",
    topics: {
      "Form 1": [
        { id: "ss1_1", name: "Culture and Heritage" },
        { id: "ss1_2", name: "Civic Rights and Responsibilities" },
        { id: "ss1_3", name: "Family and Community" }
      ],
      "Form 2": [
        { id: "ss2_1", name: "Governance and Democracy" },
        { id: "ss2_2", name: "Economic Activities" },
        { id: "ss2_3", name: "Social Issues: HIV/AIDS" }
      ],
      "Form 3": [
        { id: "ss3_1", name: "Human Rights" },
        { id: "ss3_2", name: "Conflict Resolution" },
        { id: "ss3_3", name: "Globalization" }
      ],
      "Form 4": [
        { id: "ss4_1", name: "Sustainable Development" },
        { id: "ss4_2", name: "Gender and Development" },
        { id: "ss4_3", name: "Peace and Security" }
      ]
    }
  },
  {
    id: "agriculture",
    name: "Agriculture",
    topics: {
      "Form 1": [
        { id: "ag1_1", name: "Importance of Agriculture" },
        { id: "ag1_2", name: "Soil Science" },
        { id: "ag1_3", name: "Crop Production" }
      ],
      "Form 2": [
        { id: "ag2_1", name: "Livestock Production" },
        { id: "ag2_2", name: "Farm Tools and Machinery" },
        { id: "ag2_3", name: "Agricultural Economics" }
      ],
      "Form 3": [
        { id: "ag3_1", name: "Plant Protection" },
        { id: "ag3_2", name: "Irrigation and Drainage" },
        { id: "ag3_3", name: "Forestry" }
      ],
      "Form 4": [
        { id: "ag4_1", name: "Advanced Farm Management" },
        { id: "ag4_2", name: "Agro-forestry" },
        { id: "ag4_3", name: "Marketing of Agricultural Products" }
      ]
    }
  },
  {
    id: "chichewa",
    name: "Chichewa",
    topics: {
      "Form 1": [
        { id: "ch1_1", name: "Galamala ya Chichewa" },
        { id: "ch1_2", name: "Kulemba Nkhani" },
        { id: "ch1_3", name: "Zofunika pa Moyo" }
      ],
      "Form 2": [
        { id: "ch2_1", name: "Miyambi ndi Nthano" },
        { id: "ch2_2", name: "Ndakatulo" },
        { id: "ch2_3", name: "Kumasulira" }
      ],
      "Form 3": [
        { id: "ch3_1", name: "Zolemba za Akale" },
        { id: "ch3_2", name: "Kusanthula Mabuku" },
        { id: "ch3_3", name: "Chichewa mu Malonda" }
      ],
      "Form 4": [
        { id: "ch4_1", name: "Zolemba za Makono" },
        { id: "ch4_2", name: "Kukonzekera Mayeso a MANEB" },
        { id: "ch4_3", name: "Chichewa ndi Chitukuko" }
      ]
    }
  },
  {
    id: "life_skills",
    name: "Life Skills",
    topics: {
      "Form 1": [
        { id: "ls1_1", name: "Self-Awareness" },
        { id: "ls1_2", name: "Interpersonal Relationships" },
        { id: "ls1_3", name: "Decision Making" }
      ],
      "Form 2": [
        { id: "ls2_1", name: "Communication Skills" },
        { id: "ls2_2", name: "Coping with Stress" },
        { id: "ls2_3", name: "Critical Thinking" }
      ],
      "Form 3": [
        { id: "ls3_1", name: "Leadership Skills" },
        { id: "ls3_2", name: "Financial Literacy" },
        { id: "ls3_3", name: "Career Guidance" }
      ],
      "Form 4": [
        { id: "ls4_1", name: "Entrepreneurship" },
        { id: "ls4_2", name: "Community Service" },
        { id: "ls4_3", name: "Preparation for Higher Education" }
      ]
    }
  }
];
