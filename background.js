chrome.commands.onCommand.addListener((command) => {
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
  
          if (!(command in suffixMapping)) {
            console.warn("Unrecognized command:", command);
            return;
          }
          const newSuffix = suffixMapping[command];
  
          // Remove a trailing slash if present (unless the entire path is just "/").
          let basePath = urlObj.pathname;
          if (basePath !== "/" && basePath.endsWith("/")) {
            basePath = basePath.slice(0, -1);
          }
  
          // Remove any known suffix that might be appended.
          let removedSuffix = null;
          let candidate;
          let found = true;
          while (found) {
            found = false;
            for (const suffix of Object.values(suffixMapping)) {
              candidate = "/" + suffix;
              if (basePath.endsWith(candidate)) {
                removedSuffix = suffix;
                basePath = basePath.substring(0, basePath.length - candidate.length);
                found = true;
                break; // Break the for-loop to check again from the start.
              }
            }
          }
          // Ensure the basePath is at least "/"
          if (basePath === "") {
            basePath = "/";
          }
  
          // Decide whether to toggle off or to append the new suffix:
          // - If the removed suffix equals the new suffix, toggle it off.
          // - Otherwise, append the new suffix.
          if (removedSuffix === newSuffix) {
            // Toggle off: set pathname to the cleaned basePath.
            urlObj.pathname = basePath;
          } else {
            // Append the new suffix.
            // Be careful if the basePath is the root "/" to avoid double slashes.
            if (basePath === "/") {
              urlObj.pathname = "/" + newSuffix;
            } else {
              urlObj.pathname = basePath + "/" + newSuffix;
            }
          }
  
          // Update the active tab with the new URL.
          chrome.tabs.update(currentTab.id, { url: urlObj.toString() });
        } catch (error) {
          console.error("Error processing URL:", error);
        }
      }
    });
  });
