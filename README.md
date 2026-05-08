# SRMIST GPA Calculator 🎓

A sleek, lightweight, frontend-only GPA/CGPA calculator built specifically for SRM Institute of Science and Technology students under the **21st Regulation**.

## 🎯 Features
- **Accurate Calculations:** Automatically handles the 21st regulation 75 to 40 external mark conversion.
- **SGPA & CGPA Calculation:** Easily calculate per-semester SGPA and accumulate historical data for overall CGPA tracking.
- **Grade Prediction:** Built-in estimator to predict required external exam marks to hit a target grade.
- **Local Storage Saver:** Automatically saves your semesters locally so you never lose your progress! No sign-up required.
- **Chart Analysis:** Visualize your academic performance via beautiful GPA trends!
- **Apple-inspired UI:** Glassmorphism, smooth animations, and a stunning dark mode interface.
- **Mobile Responsive:** Works perfectly across desktop, tablet, and mobile devices.

## 🧮 21st Regulation Logic
- **Internal Marks:** Out of 60
- **External Marks:** Out of 75 (Automatically converted to 40)
- **Total Marks:** Internal + Converted External.
- **Pass Mark:** 50
- Grades Range from **O (10 points)** to **F (Fail - 0 points)**

## 📂 Project Structure

```
srmgpa/
│
├── index.html        # Main HTML structure
├── style.css         # Styling (Glassmorphism & animations)
├── script.js         # Core application logic & Chart rendering
├── README.md         # Project documentation
└── assets/
    ├── icons/
    └── images/       # Store logo/icons here
```

## 🛠️ Technologies Used
- HTML5
- CSS3 (Vanilla)
- Vanilla JavaScript
- Chart.js (CDN)
- FontAwesome (Icons)
- Google Fonts (Inter)

## 🚀 How to use
There are no build steps, frameworks, or databases needed! 
Simply download the repository and open `index.html` in your favorite web browser.

## 🌐 GitHub Pages Deployment
Because this project contains pure static files, it can be deployed on GitHub Pages in under a minute:

1. Push this code to your repository: `https://github.com/saiimmani/srmgpa.git`
2. Navigate to your repository settings on GitHub.
3. Click on **Pages** in the left sidebar.
4. Under "Build and deployment", set the Source to **Deploy from a branch**.
5. Select the **main** branch and the `/root` folder.
6. Click **Save**.

Your website will be live in a few moments!

## 📸 Screenshots
*(Add screenshots of your application here)*

---
Built with ❤️ for SRM Students.