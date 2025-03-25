document.addEventListener('DOMContentLoaded', function() {
    // Initialize settings
    const config = {
        clickGameDuration: 30,
        doubleClickGameDuration: 30,
        targetSize: isMobile() ? 70 : 80,
        touchTimeout: 500 // ms to detect double-tap
    };
    
    // Setup the UI and event handlers
    setupMouseActivities(config);
    
    // Helper function to detect mobile
    function isMobile() {
        return window.innerWidth <= 767 || 'ontouchstart' in window;
    }
    
    function setupMouseActivities(config) {
        const mouseLearningContainer = document.querySelector('.mouse-learning-container');
        const activityTabs = document.querySelectorAll('.activity-tab');
        const activityContainers = document.querySelectorAll('.activity-container');
        const startButtons = document.querySelectorAll('.start-activity-btn');
        
        // Activity tab switching
        activityTabs.forEach(tab => {
            tab.addEventListener('click', () => switchActivity(tab));
            tab.addEventListener('touchend', (e) => {
                e.preventDefault();
                switchActivity(tab);
            });
        });
        
        function switchActivity(tab) {
            const activity = tab.getAttribute('data-activity');
            
            // Update active tab
            activityTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show selected activity
            activityContainers.forEach(container => {
                container.classList.remove('active');
                if (container.classList.contains(`${activity}-activity`)) {
                    container.classList.add('active');
                }
            });
        }
        
        // Initialize click activity
        initClickActivity(startButtons[0], config);
        
        // Initialize double-click activity
        initDoubleClickActivity(startButtons[1], config);
        
        // Initialize drag activity
        initDragActivity(startButtons[2], config);
    }
    
    function initClickActivity(startButton, config) {
        const clickGameArea = document.querySelector('.click-game-area');
        const clickScoreDisplay = clickGameArea.querySelector('.score');
        const clickTimerDisplay = clickGameArea.querySelector('.timer');
        
        let clickScore = 0;
        let clickTimer = config.clickGameDuration;
        let clickInterval;
        let currentTarget;
        
        startButton.addEventListener('click', startClickActivity);
        startButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startClickActivity();
        });
        
        function startClickActivity() {
            // Reset game
            clickScore = 0;
            clickTimer = config.clickGameDuration;
            clickScoreDisplay.textContent = clickScore;
            clickTimerDisplay.textContent = clickTimer;
            
            // Remove any existing targets and completion messages
            clearGameArea();
            
            // Start timer
            clickInterval = setInterval(() => {
                clickTimer--;
                clickTimerDisplay.textContent = clickTimer;
                
                if (clickTimer <= 0) {
                    endClickActivity();
                }
            }, 1000);
            
            // Create first target
            createClickTarget();
            
            // Hide start button
            startButton.style.display = 'none';
        }
        
        function clearGameArea() {
            // Clear any existing targets
            if (currentTarget) {
                currentTarget.remove();
                currentTarget = null;
            }
            
            // Remove completion message if exists
            const existingMessage = clickGameArea.querySelector('.completion-message');
            if (existingMessage) {
                existingMessage.remove();
            }
        }
        
        function createClickTarget() {
            if (currentTarget) {
                currentTarget.remove();
            }
            
            // Create a new target
            currentTarget = document.createElement('div');
            currentTarget.className = 'click-target';
            
            // Random position within game area bounds
            const gameAreaRect = clickGameArea.getBoundingClientRect();
            const targetSize = config.targetSize;
            
            const maxX = gameAreaRect.width - targetSize;
            const maxY = gameAreaRect.height - targetSize - 40;
            
            const randomX = Math.floor(Math.random() * maxX);
            const randomY = Math.floor(Math.random() * maxY) + 40;
            
            currentTarget.style.left = `${randomX}px`;
            currentTarget.style.top = `${randomY}px`;
            
            // Set size (with slight variation)
            const sizeVariation = Math.floor(Math.random() * 10);
            currentTarget.style.width = `${targetSize + sizeVariation}px`;
            currentTarget.style.height = `${targetSize + sizeVariation}px`;
            
            // Add to game area
            clickGameArea.appendChild(currentTarget);
            
            // Add event listeners for both mouse and touch
            currentTarget.addEventListener('click', handleTargetClick);
            currentTarget.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleTargetClick();
            }, {passive: false});
        }
        
        function handleTargetClick() {
            // Remove event listeners to prevent multiple clicks
            currentTarget.removeEventListener('click', handleTargetClick);
            currentTarget.removeEventListener('touchstart', handleTargetClick);
            
            // Visual feedback for successful click
            currentTarget.classList.add('clicked');
            
            // Increase score
            clickScore++;
            clickScoreDisplay.textContent = clickScore;
            
            // Update progress bar
            updateProgressBar('click', clickScore);
            
            // Create new target after delay
            setTimeout(() => {
                if (clickTimer > 0) {
                    createClickTarget();
                }
            }, 300);
        }
        
        function endClickActivity() {
            clearInterval(clickInterval);
            
            if (currentTarget) {
                currentTarget.remove();
                currentTarget = null;
            }
            
            // Show completion message
            const completionMessage = document.createElement('div');
            completionMessage.className = 'completion-message';
            completionMessage.innerHTML = `
                <h3>Atividade Concluída!</h3>
                <p>Sua pontuação: ${clickScore}</p>
                <p>${getScoreMessage(clickScore)}</p>
            `;
            clickGameArea.appendChild(completionMessage);
            
            // Show start button again
            startButton.style.display = 'block';
        }
    }
    
    function initDoubleClickActivity(startButton, config) {
        const doubleClickArea = document.querySelector('.doubleclick-game-area');
        const doubleClickScoreDisplay = doubleClickArea.querySelector('.score');
        const doubleClickTimerDisplay = doubleClickArea.querySelector('.timer');
        const folderItems = doubleClickArea.querySelectorAll('.folder-item');
        
        let doubleClickScore = 0;
        let doubleClickTimer = config.doubleClickGameDuration;
        let doubleClickInterval;
        let activeFolder = null;
        
        startButton.addEventListener('click', startDoubleClickActivity);
        startButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startDoubleClickActivity();
        });
        
        function startDoubleClickActivity() {
            // Reset game
            doubleClickScore = 0;
            doubleClickTimer = config.doubleClickGameDuration;
            doubleClickScoreDisplay.textContent = doubleClickScore;
            doubleClickTimerDisplay.textContent = doubleClickTimer;
            
            // Reset folders
            folderItems.forEach(folder => {
                folder.setAttribute('data-status', 'inactive');
                folder.classList.remove('active', 'success');
            });
            
            // Remove completion message if exists
            const existingMessage = doubleClickArea.querySelector('.completion-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            // Start timer
            doubleClickInterval = setInterval(() => {
                doubleClickTimer--;
                doubleClickTimerDisplay.textContent = doubleClickTimer;
                
                if (doubleClickTimer <= 0) {
                    endDoubleClickActivity();
                }
            }, 1000);
            
            // Activate first folder
            activateRandomFolder();
            
            // Hide start button
            startButton.style.display = 'none';
        }
        
        function activateRandomFolder() {
            // Deactivate previous folder if exists
            if (activeFolder) {
                activeFolder.setAttribute('data-status', 'inactive');
                activeFolder.classList.remove('active');
            }
            
            // Get inactive folders
            const inactiveFolders = Array.from(folderItems).filter(
                folder => folder.getAttribute('data-status') !== 'success'
            );
            
            if (inactiveFolders.length === 0) {
                // All folders have been clicked, reset
                folderItems.forEach(folder => {
                    folder.setAttribute('data-status', 'inactive');
                    folder.classList.remove('active', 'success');
                });
                
                // Get the first folder
                activeFolder = folderItems[0];
            } else {
                // Get random inactive folder
                const randomIndex = Math.floor(Math.random() * inactiveFolders.length);
                activeFolder = inactiveFolders[randomIndex];
            }
            
            // Activate folder
            activeFolder.setAttribute('data-status', 'active');
            activeFolder.classList.add('active');
        }
        
        // Set up folder interactions for both desktop and mobile
        folderItems.forEach(folder => {
            // Double-click handling for desktop
            folder.addEventListener('dblclick', () => handleFolderDoubleClick(folder));
            
            // Double-tap handling for mobile
            let lastTap = 0;
            folder.addEventListener('touchstart', function(e) {
                e.preventDefault();
                
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                
                if (tapLength < config.touchTimeout && tapLength > 0) {
                    // Double tap detected
                    handleFolderDoubleClick(folder);
                }
                
                lastTap = currentTime;
            }, {passive: false});
            
            // Prevent text selection on both desktop and mobile
            folder.addEventListener('mousedown', (e) => e.preventDefault());
            folder.addEventListener('touchstart', (e) => e.preventDefault(), {passive: false});
        });
        
        function handleFolderDoubleClick(folder) {
            const status = folder.getAttribute('data-status');
            if (status === 'active' && doubleClickTimer > 0) {
                // Success!
                folder.setAttribute('data-status', 'success');
                folder.classList.remove('active');
                
                // Increase score
                doubleClickScore++;
                doubleClickScoreDisplay.textContent = doubleClickScore;
                
                // Update progress bar
                updateProgressBar('doubleclick', doubleClickScore);
                
                // Activate next folder
                setTimeout(activateRandomFolder, 500);
            }
        }
        
        function endDoubleClickActivity() {
            clearInterval(doubleClickInterval);
            
            // Deactivate active folder
            if (activeFolder) {
                activeFolder.setAttribute('data-status', 'inactive');
                activeFolder.classList.remove('active');
            }
            
            // Show completion message
            const completionMessage = document.createElement('div');
            completionMessage.className = 'completion-message';
            completionMessage.innerHTML = `
                <h3>Atividade Concluída!</h3>
                <p>Sua pontuação: ${doubleClickScore}</p>
                <p>${getScoreMessage(doubleClickScore)}</p>
            `;
            doubleClickArea.appendChild(completionMessage);
            
            // Show start button again
            startButton.style.display = 'block';
        }
    }
    
    function initDragActivity(startButton, config) {
        const dragGameArea = document.querySelector('.drag-game-area');
        const dragItems = dragGameArea.querySelectorAll('.drag-item');
        const dropZones = dragGameArea.querySelectorAll('.drop-zone');
        const dragScoreDisplay = dragGameArea.querySelector('.score');
        
        let dragScore = 0;
        let dragActivityActive = false;
        let draggedItem = null;
        
        startButton.addEventListener('click', startDragActivity);
        startButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startDragActivity();
        });
        
        function startDragActivity() {
            // Reset game
            dragScore = 0;
            dragScoreDisplay.textContent = dragScore;
            dragActivityActive = true;
            
            // Reset items and zones
            resetDragItems();
            
            // Hide start button
            startButton.style.display = 'none';
        }
        
        function resetDragItems() {
            // Clear completion message if exists
            const existingMessage = dragGameArea.querySelector('.completion-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            // Reset all drag items
            dragItems.forEach(item => {
                item.classList.remove('placed', 'wrong');
                item.style.opacity = 1;
                item.style.pointerEvents = 'auto';
                item.style.position = '';
                item.style.top = '';
                item.style.left = '';
                item.style.zIndex = '';
                
                // Return to original container
                const dragItemsContainer = dragGameArea.querySelector('.drag-items-container');
                dragItemsContainer.appendChild(item);
            });
            
            // Reset drop zones
            dropZones.forEach(zone => {
                zone.classList.remove('filled', 'highlight', 'wrong');
            });
        }
        
        // Set up desktop drag and drop
        dragItems.forEach(item => {
            // Desktop drag events
            item.addEventListener('dragstart', function(e) {
                if (!dragActivityActive) return;
                
                draggedItem = this;
                this.classList.add('dragging');
                e.dataTransfer.setData('text/plain', this.getAttribute('data-item-type'));
                
                setTimeout(() => {
                    this.style.opacity = '0.4';
                }, 0);
            });
            
            item.addEventListener('dragend', function() {
                this.classList.remove('dragging');
                this.style.opacity = '1';
                draggedItem = null;
            });
            
            // Mobile touch events
            item.addEventListener('touchstart', function(e) {
                if (!dragActivityActive) return;
                
                e.preventDefault();
                draggedItem = this;
                this.classList.add('dragging');
                
                // Store the initial touch position
                const touch = e.touches[0];
                const startX = touch.clientX;
                const startY = touch.clientY;
                
                // Set initial styles
                this.initialX = startX;
                this.initialY = startY;
                this.startOffsetLeft = this.offsetLeft;
                this.startOffsetTop = this.offsetTop;
            }, {passive: false});
            
            item.addEventListener('touchmove', function(e) {
                if (!dragActivityActive || !draggedItem) return;
                
                e.preventDefault();
                
                const touch = e.touches[0];
                
                // Position the item under the finger
                this.style.position = 'fixed';
                this.style.left = (touch.clientX - this.offsetWidth/2) + 'px';
                this.style.top = (touch.clientY - this.offsetHeight/2) + 'px';
                this.style.zIndex = '1000';
                
                // Highlight drop zones under touch
                highlightDropZoneAtPosition(touch.clientX, touch.clientY);
            }, {passive: false});
            
            item.addEventListener('touchend', function(e) {
                if (!dragActivityActive || !draggedItem) return;
                
                this.classList.remove('dragging');
                
                const touch = e.changedTouches[0];
                const dropZone = getDropZoneAtPosition(touch.clientX, touch.clientY);
                
                handleItemDrop(this, dropZone, touch.clientX, touch.clientY);
            });
        });
        
        // Set up desktop drop zones
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', function(e) {
                if (!dragActivityActive) return;
                e.preventDefault();
            });
            
            zone.addEventListener('dragenter', function(e) {
                if (!dragActivityActive) return;
                e.preventDefault();
                this.classList.add('highlight');
            });
            
            zone.addEventListener('dragleave', function() {
                if (!dragActivityActive) return;
                this.classList.remove('highlight');
            });
            
            zone.addEventListener('drop', function(e) {
                if (!dragActivityActive) return;
                e.preventDefault();
                this.classList.remove('highlight');
                
                const itemType = e.dataTransfer.getData('text/plain');
                handleItemDrop(draggedItem, this, null, null, itemType);
            });
        });
        
        function highlightDropZoneAtPosition(x, y) {
            dropZones.forEach(zone => {
                const rect = zone.getBoundingClientRect();
                if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                    zone.classList.add('highlight');
                } else {
                    zone.classList.remove('highlight');
                }
            });
        }
        
        function getDropZoneAtPosition(x, y) {
            for (const zone of dropZones) {
                const rect = zone.getBoundingClientRect();
                if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                    return zone;
                }
            }
            return null;
        }
        
        function handleItemDrop(item, zone, x, y, itemType = null) {
            // Clear all highlight effects
            dropZones.forEach(z => z.classList.remove('highlight'));
            
            // Reset item position
            item.style.position = '';
            item.style.left = '';
            item.style.top = '';
            item.style.zIndex = '';
            
            if (!zone) {
                // If no valid drop zone, return item to container
                const dragItemsContainer = dragGameArea.querySelector('.drag-items-container');
                dragItemsContainer.appendChild(item);
                return;
            }
            
            // Get item type if not provided (for touch events)
            if (!itemType) {
                itemType = item.getAttribute('data-item-type');
            }
            
            const zoneType = zone.getAttribute('data-zone-type');
            
            // Check if correct zone
            if (itemType === zoneType) {
                // Success!
                zone.classList.add('filled');
                item.classList.add('placed');
                
                // Move item to zone
                zone.appendChild(item);
                
                // Increase score
                dragScore++;
                dragScoreDisplay.textContent = dragScore;
                
                // Update progress
                updateProgressBar('drag', dragScore / 4 * 100);
                
                // Check if all items placed
                if (dragScore >= 4) {
                    endDragActivity(true);
                }
            } else {
                // Wrong zone
                item.classList.add('wrong');
                zone.classList.add('wrong');
                
                // Return item to container after feedback
                setTimeout(() => {
                    item.classList.remove('wrong');
                    zone.classList.remove('wrong');
                    
                    const dragItemsContainer = dragGameArea.querySelector('.drag-items-container');
                    dragItemsContainer.appendChild(item);
                }, 800);
            }
        }
        
        function endDragActivity(success = false) {
            dragActivityActive = false;
            
            // Show completion message
            const completionMessage = document.createElement('div');
            completionMessage.className = 'completion-message';
            completionMessage.innerHTML = `
                <h3>Atividade Concluída!</h3>
                <p>Itens colocados: ${dragScore}/4</p>
                <p>${success ? 'Excelente trabalho!' : 'Continue praticando!'}</p>
            `;
            dragGameArea.appendChild(completionMessage);
            
            // Show start button again
            startButton.style.display = 'block';
            
            // If successful, add confetti effect
            if (success) {
                celebrateSuccess();
            }
        }
    }
    
    // Helper function to update progress bar
    function updateProgressBar(activity, score) {
        const progressBar = document.querySelector('.progress-bar');
        let progress = 0;
        
        switch (activity) {
            case 'click':
                progress = Math.min(score / 10 * 100, 100);
                break;
            case 'doubleclick':
                progress = Math.min(score / 15 * 100, 100);
                break;
            case 'drag':
                progress = score; // already calculated as percentage
                break;
        }
        
        progressBar.style.width = `${progress}%`;
    }
    
    // Helper function for score messages
    function getScoreMessage(score) {
        if (score >= 10) return 'Excelente trabalho! Você já é um expert!';
        if (score >= 5) return 'Muito bom! Você está dominando o mouse!';
        if (score >= 3) return 'Bom trabalho! Continue praticando!';
        return 'Continue praticando, você vai melhorar!';
    }
    
    // Create confetti celebration effect
    function celebrateSuccess() {
        for (let i = 0; i < 50; i++) {
            createConfettiParticle();
        }
    }
    
    function createConfettiParticle() {
        const confetti = document.createElement('div');
        const container = document.querySelector('.mouse-learning-container');
        
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = getRandomColor();
        confetti.style.borderRadius = '50%';
        confetti.style.top = '-10px';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.transform = 'scale(' + (Math.random() * 0.6 + 0.4) + ')';
        confetti.style.zIndex = '1000';
        container.appendChild(confetti);
        
        // Animate confetti
        const animation = confetti.animate([
            { 
                top: '-10px', 
                transform: 'scale(' + (Math.random() * 0.6 + 0.4) + ') rotate(0deg)',
                opacity: 1 
            },
            { 
                top: container.offsetHeight + 'px', 
                transform: 'scale(' + (Math.random() * 0.6 + 0.4) + ') rotate(' + (Math.random() * 360) + 'deg)',
                opacity: 0 
            }
        ], {
            duration: Math.random() * 2000 + 1500,
            easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
        });
        
        animation.onfinish = function() {
            confetti.remove();
        };
    }
    
    function getRandomColor() {
        const colors = ['#8EC6E6', '#a5d4ec', '#4CAF50', '#FFC107', '#E91E63', '#9C27B0'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
});
