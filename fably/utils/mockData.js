export const MOCK_STORY = {
    lines: [
        { text: "Once upon a time in a small village", isTranslation: false },
        { text: "Bere bi wo kuro ketewa bi mu", isTranslation: true },
        { text: "There lived a brave young girl named Ama", isTranslation: false },
        { text: "Na abeburoo kokuroo bi te hɔ a wɔfrɛ no Ama", isTranslation: true },
    ],
    currentPage: 1,
    totalPages: 3,
    hasNext: true,
    hasPrevious: false
};

export const MOCK_PAGES = [
    MOCK_STORY,
    {
        lines: [
            { text: "She loved to help others in her community", isTranslation: false },
            { text: "Na ɔpɛ sɛ ɔboa afoforo wɔ ne mpɔtam hɔ", isTranslation: true },
            { text: "Every day she would share her food with those in need", isTranslation: false },
            { text: "Da biara na ɔne afoforo kyɛ n'aduane", isTranslation: true },
        ],
        currentPage: 2,
        totalPages: 3,
        hasNext: true,
        hasPrevious: true
    },
    {
        lines: [
            { text: "And that's how she became known as the kind helper", isTranslation: false },
            { text: "Na saa na ɔbɛyɛɛ ɔboafo pa", isTranslation: true },
            { text: "The End", isTranslation: false },
            { text: "Awie", isTranslation: true },
        ],
        currentPage: 3,
        totalPages: 3,
        hasNext: false,
        hasPrevious: true
    }
];
