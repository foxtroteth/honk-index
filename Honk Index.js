// API URL
const apiUrl = "http://honk.etherobot.xyz/metrics";

// Profile Image URL
const imageUrl = "https://i.imgur.com/vfYZZms.jpeg";

/**
 * Converts a string with "K", "M", or "B" suffixes into a numeric value.
 * @param {string} str - The string to parse.
 * @returns {number} - The numeric value.
 */
function parseAbbreviatedNumber(str) {
  const value = parseFloat(str);
  if (str.includes("B")) return value * 1_000_000_000; // Billions
  if (str.includes("M")) return value * 1_000_000; // Millions
  if (str.includes("K")) return value * 1_000; // Thousands
  return value; // No abbreviation
}

// Detect light/dark mode and set colors accordingly
const isDarkMode = Device.isUsingDarkAppearance();
const backgroundColor = isDarkMode ? new Color("#1c1c1e") : new Color("#f4f4f8"); // Dark: Blackish | Light: Soft white
const textColor = isDarkMode ? new Color("#f4f4f8") : new Color("#333333"); // Dark: Light text | Light: Dark text
const secondaryTextColor = isDarkMode ? new Color("#aaaaaa") : new Color("#555555"); // Dark: Gray | Light: Medium gray

try {
  // Fetch data from the API
  let response = await new Request(apiUrl).loadJSON();

  // Validate the response
  if (!Array.isArray(response)) {
    throw new Error("API response is not an array.");
  }

  // Create the widget
  let widget = new ListWidget();
  widget.backgroundColor = backgroundColor;

  // Add padding at the top
  widget.addSpacer(16);

  // Add profile image and title
  let headerStack = widget.addStack();
  headerStack.centerAlignContent();

  try {
    // Attempt to load the profile image
    let imgRequest = new Request(imageUrl);
    let img = await imgRequest.loadImage();
    let profileImg = headerStack.addImage(img);
    profileImg.imageSize = new Size(30, 30); // Smaller image size
    profileImg.cornerRadius = 15;

    headerStack.addSpacer(6); // Add spacing if the image is successfully loaded
  } catch (imageError) {
    // Log an error if the image cannot be loaded
    console.warn("Image could not be loaded. Skipping image.");
  }

  // Add the title with "Honk" and "Metrics" in different colors
  let honkText = headerStack.addText("Honk ");
  honkText.font = Font.boldSystemFont(14); // Smaller font size
  honkText.textColor = new Color("#29b0d2"); // Blueish color for "Honk"

  let metricsText = headerStack.addText("Index");
  metricsText.font = Font.boldSystemFont(14); // Smaller font size
  metricsText.textColor = new Color("#6d63bd"); // Purpleish color for "Index"

  widget.addSpacer(8); // Adjust spacing below the header

  // Loop through metrics and display them
  response.forEach((metric) => {
    let metricStack = widget.addStack();
    metricStack.centerAlignContent();

    // Metric name in bold
    let metricName = metricStack.addText(`${metric.name}: `);
    metricName.font = Font.boldSystemFont(12); // Smaller font size
    metricName.textColor = textColor;

    // Metric value in soft color
    let metricValue = metricStack.addText(metric.value.toString());
    metricValue.font = Font.mediumSystemFont(12); // Smaller font size
    metricValue.textColor = secondaryTextColor;

    // Determine the color of the metric difference
    let diffColor;
    if (metric.name === "Imb") {
      // Reverse logic for Imb: Red for positive, Green for negative
      diffColor = metric.diff.includes("+") ? new Color("#FF0000") : new Color("#228B22"); // Dark green
    } else {
      // Default logic: Green for positive, Red for negative
      diffColor = metric.diff.includes("+") ? new Color("#228B22") : new Color("#FF0000"); // Dark green
    }

    // Metric diff in smaller, styled text
    let metricDiff = metricStack.addText(` ${metric.diff}`);
    metricDiff.font = Font.italicSystemFont(10); // Smaller font size
    metricDiff.textColor = diffColor;

    widget.addSpacer(4); // Reduce spacing between metrics
  });

  // Add a footer with subtle separator
  widget.addSpacer();
  let separator = widget.addText("");
  separator.font = Font.mediumSystemFont(10); // Smaller font size
  separator.textColor = secondaryTextColor;
  separator.centerAlignText();

  // Display the widget
  if (config.runsInWidget) {
    Script.setWidget(widget);
  } else {
    widget.presentMedium(); // Medium-sized widget for testing
  }
} catch (error) {
  // Handle errors gracefully
  let widget = new ListWidget();
  widget.backgroundColor = new Color("#fff0f0"); // Light red background for error
  let errorText = widget.addText("Error Loading Metrics");
  errorText.font = Font.boldSystemFont(14); // Smaller font size
  errorText.textColor = Color.red();
  errorText.centerAlignText();
  widget.addSpacer();
  let errorDetails = widget.addText(error.message);
  errorDetails.font = Font.mediumSystemFont(10); // Smaller font size
  errorDetails.textColor = new Color("#555555");
  errorDetails.centerAlignText();
  Script.setWidget(widget);
}
Script.complete();
