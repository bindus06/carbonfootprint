// List of available themes
const themes = [
    { name: "Default", file: "style/default-theme.css" },
    { name: "Dark", file: "style/dark-theme.css" },
    { name: "Nature Green", file: "style/green-theme.css" },
    { name: "Ocean Blue", file: "style/blue-theme.css" },
    { name: "Solarized", file: "style/light-green-theme.css" }
];

let currentThemeIndex = 0;

// Function to switch to the next theme
function switchTheme() {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const selectedTheme = themes[currentThemeIndex];

    document.getElementById("theme").href = selectedTheme.file;
    localStorage.setItem("theme", selectedTheme.file);
    localStorage.setItem("themeIndex", currentThemeIndex);
    
    document.getElementById("theme-name").innerText = Theme: ${selectedTheme.name};
}

// Function to apply the saved theme on page load
function applySavedTheme() {
    const savedTheme = localStorage.getItem("theme") || themes[0].file;
    currentThemeIndex = parseInt(localStorage.getItem("themeIndex")) || 0;

    document.getElementById("theme").href = savedTheme;
    document.getElementById("theme-name").innerText = Theme: ${themes[currentThemeIndex].name};
}

// Function to fetch AI-generated reward
async function getReward() {
    try {
        const openaiApiKey = "Your_open_AI_access_key"; // Replace with your OpenAI API key
        const unsplashAccessKey = "your_unsplash_access_key"; // Replace with your Unsplash API key

        let badgeTitle = "Eco Novice"; // Default beginner badge
        let badgeDesc = "You're taking your first steps towards sustainability!";
        let badgeImageUrl = "img1.jpg"; // Default fallback image

        // Fetch AI-generated reward title & description
        const aiResponse = await fetch("https://api.openai.com/v1/completions", {
            method: "POST",
            headers: {
                "Authorization": Bearer ${openaiApiKey},
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4",
                prompt: Create a unique eco-friendly badge name and description for a user with 500 points.,
                max_tokens: 50
            })
        });

        if (!aiResponse.ok) throw new Error("Failed to fetch badge from OpenAI.");
        const aiData = await aiResponse.json();

        if (aiData.choices?.length > 0) {
            const aiGeneratedText = aiData.choices[0]?.text?.trim();
            if (aiGeneratedText) {
                const splitText = aiGeneratedText.split(": ");
                badgeTitle = splitText[0] || badgeTitle;
                badgeDesc = splitText[1] || badgeDesc;
            }
        }

        // Fetch AI-generated badge image from Unsplash
        const unsplashResponse = await fetch(https://api.unsplash.com/photos/random?query=eco-friendly&client_id=${unsplashAccessKey});
        if (unsplashResponse.ok) {
            const unsplashData = await unsplashResponse.json();
            badgeImageUrl = unsplashData?.urls?.small || badgeImageUrl;
        }

        // Update UI
        if (typeof document !== "undefined") {
            document.getElementById("badges").innerHTML = `
                <img src="${badgeImageUrl}" class="w-32 h-32 mb-2">
                <p class="font-bold">${badgeTitle}</p>
                <p>${badgeDesc}</p>
            `;
        }

    } catch (error) {
        console.error("Error fetching AI-generated reward:", error);
        // Display default badge if API fails
        if (typeof document !== "undefined") {
            document.getElementById("badges").innerHTML = `
                <img src="img1.jpg" class="w-32 h-32 mb-2">
                <p class="font-bold">Eco Novice</p>
                <p>You're taking your first steps towards sustainability!</p>
            `;
        }
    }
}

// Function to track streaks
function updateStreak() {
    const today = new Date().toISOString().split("T")[0];
    const lastLogin = localStorage.getItem("lastLogin");
    let streak = parseInt(localStorage.getItem("streak")) || 0;

    if (lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        streak = lastLogin === yesterdayStr ? streak + 1 : 1;

        localStorage.setItem("streak", streak);
        localStorage.setItem("lastLogin", today);
    }

    if (typeof document !== "undefined") {
        document.getElementById("streak").innerText = 🔥 ${streak} Day Streak;
    }
}

// Run only in browser
if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
        applySavedTheme();
        getReward();
        updateStreak();
    });
}