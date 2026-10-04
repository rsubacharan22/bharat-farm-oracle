# Bharat Soil Insights

Build a functional hackathon prototype called:

# Bharat Soil Oracle
### Hyper-Local Regenerative Farming Operating System for Indian Smallholder Farmers

This is for the Schneider Electric Yuva Yodha Energy Tech Hackathon 2026 — Sustainable Agriculture: Energy, Water & Productivity.

Build a modern, professional agricultural intelligence web application.

## CORE IDEA

Bharat Soil Oracle creates a plot-level Digital Twin by combining:

- Soil moisture sensor data
- Weather data
- Rainfall forecast
- Crop stage
- Irrigation history
- Simulated satellite indicators

The Digital Twin is then used to make an explainable irrigation recommendation.

IMPORTANT:
This is a prototype. Use deterministic simulated data. Do not pretend that live IoT or satellite data is connected.

## MAIN PAGES

Create these pages:

1. Dashboard
2. Digital Twin
3. Irrigation Advisor
4. Crop Health
5. Impact
6. What-if Simulator

## DASHBOARD

Show:

- Farm name
- Location
- Crop
- Farm area
- Current soil moisture
- Root-zone moisture
- Crop stage
- Temperature
- Rainfall forecast
- Current irrigation status
- Recommendation
- Confidence
- Estimated water impact
- Estimated energy impact

Use realistic Indian smallholder farm demo data.

## DIGITAL TWIN

Create a visual representation of the current plot state.

Show:

- Root-zone moisture
- Soil moisture at two depths
- Soil-water status
- Crop stage
- ET0
- Crop water demand
- Rainfall forecast
- Vegetation health
- Sensor confidence
- Last updated

The Digital Twin should update when scenario values change.

## IRRIGATION ENGINE

Implement deterministic explainable logic.

Inputs:

- Soil moisture
- Root-zone moisture
- Crop stage
- ET0
- Rainfall forecast
- Crop water demand
- Last irrigation

Outputs:

- Recommendation
- Recommended timing
- Water required
- Pump runtime
- Estimated energy
- Confidence
- Reasons

Possible recommendations:

IRRIGATE NOW
IRRIGATE SOON
WAIT
SKIP — RAIN EXPECTED

Do NOT use an LLM to make the irrigation decision.

Use transparent rules/formulas in the application code.

## CRITICAL DEMO

Create a What-if Simulator where the user can change:

- Soil moisture
- Rain forecast
- Crop stage
- ET0

The recommendation must change dynamically.

Demo scenario 1:

Soil moisture = 22%
Rain forecast = 0 mm
Crop stage = Flowering

Expected:
IRRIGATE NOW

Demo scenario 2:

Soil moisture = 22%
Rain forecast = 20 mm
Crop stage = Flowering

Expected:
WAIT / SKIP — RAIN EXPECTED

Demo scenario 3:

Soil moisture = 48%
Rain forecast = 0 mm

Expected:
WAIT

## IMPACT

Calculate model-estimated:

- Water required
- Water saved
- Pump runtime
- Energy consumed
- Energy saved
- Estimated cost

Clearly label these as:

"Prototype scenario estimate"

Do not claim these are experimentally validated savings.

## DESIGN

Make the interface look like a serious climate/agriculture technology product.

Use:

- clean dashboard
- charts
- farm map/plot visualization
- status cards
- recommendation card
- confidence indicator
- responsive design

Avoid excessive decorative elements.

The application should feel suitable for a Schneider Electric technology hackathon.

## IMPORTANT

Prioritize FUNCTIONALITY over visual decoration.

The simulator must actually change the Digital Twin, recommendation, water requirement, pump runtime and energy calculations.

Create the application and make it runnable.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f48491d9-7ef3-4005-ad79-b5d22ebda0a3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
