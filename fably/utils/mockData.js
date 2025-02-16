export const MOCK_STORY = {
    page: 1,
    total_pages: 3,
    has_next: true,
    has_previous: false,
    lines: [
        "Herr Von Muellerhoff stood proudly in his grand library",
        "(Herr Von Muellerhoff gyina ne nwoma dan mu ahokyere mu)",
        "His collection of magical books sparkled in the candlelight",
        "(Ne nhoma ahoɔden hyerɛn wɔ kanea no mu)",
        "But today, something felt different in the air",
        "(Nanso ɛnnɛ, biribi foforɔ wɔ mframa no mu)"
    ]
};

export const MOCK_PAGES = {
    1: MOCK_STORY,
    2: {
        page: 2,
        total_pages: 3,
        has_next: true,
        has_previous: true,
        lines: [
            "The magical books began to float off their shelves",
            "(Nhoma ahoɔden no fii ase ma wɔn ho so firii shelf no so)",
            "Herr Von Muellerhoff adjusted his monocle in amazement",
            "(Herr Von Muellerhoff siesie ne monocle wɔ ahodwiri mu)",
        ]
    },
    3: {
        page: 3,
        total_pages: 3,
        has_next: false,
        has_previous: true,
        lines: [
            "Perhaps it was time to share his magical library with the world",
            "(Ebia na ɛyɛ berɛ a ɔbɛkyɛ ne nwoma dan ahoɔden no akyɛ wiase)",
            "After all, magic belongs to everyone",
            "(Nea ɛwɔ akyiri no, ahoɔden yɛ obiara dea)"
        ]
    },
    
};
