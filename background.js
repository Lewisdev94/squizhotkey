chrome.commands.onCommand.addListener((command) => {
    // Query the active tab in the current window.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab && currentTab.url) {
            try {
                const urlObj = new URL(currentTab.url);

                // Map commands to their corresponding suffix strings.
                const suffixMapping = {
                    "open-admin": "_admin",
                    "open-recache": "_recache",
                    "open-nocache": "_nocache"
                };

                // Ensure the command is recognized.
                if (!(command in suffixMapping)) {
                    return;
                }
                const newSuffix = suffixMapping[command];

                // Start with the current pathname.
                let originalPath = urlObj.pathname;

                // Remove any trailing suffixes.
                let lastRemovedSuffix = null;
                while (true) {
                    let found = false;
                    // Loop through all known suffixes.
                    for (const suffix of Object.values(suffixMapping)) {
                        // Check if the pathname ends with "/" followed by a suffix.
                        if (originalPath.endsWith('/' + suffix)) {
                            // Record the removed suffix.
                            lastRemovedSuffix = suffix;
                            // Remove the suffix (and its preceding slash) from the end.
                            originalPath = originalPath.substring(0, originalPath.length - (suffix.length + 1));
                            found = true;
                            break; // Exit the for-loop to check again.
                        }
                    }
                    if (!found) {
                        break;
                    }
                }

                // Make sure we have a proper trailing slash.
                if (originalPath === "") {
                    originalPath = "/";
                } else if (!originalPath.endsWith('/')) {
                    originalPath += '/';
                }

                // Decide whether to toggle off or append a new suffix:
                // If the last removed suffix equals the new suffix, then toggle it off.
                // Otherwise, append the new suffix.
                if (lastRemovedSuffix === newSuffix) {
                    urlObj.pathname = originalPath;
                } else {
                    urlObj.pathname = originalPath + newSuffix;
                }

                // Update the active tab with the new URL.
                chrome.tabs.update(currentTab.id, { url: urlObj.toString() });
            } catch (error) {
                console.error('Error processing URL:', error);
            }
        }
    });
});
