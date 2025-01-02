// Game State and Observer System
class ClassroomState {
    constructor() {
        this.state = {
            students: [],
            groups: []
        };
        this.observers = []

    }

    // Observers

    addObserver(observer) {
        this.observers.push(observer);
    }

    notifyObservers(eventType, payload) {
        // console.log(`Notifying observers for the event: ${eventType}`);
        setTimeout(() => {
            this.observers.forEach((observer) => {
                observer.update(eventType, payload)
            });
        }, 0);
    }

    // Methods

    populateBoard(students) {
        // Generate 36 student names

        if (!students || students.length === 0) {
            alert("No students found. Please go back and enter a student list.");
            window.location.href = "input.html";
            return;
        }
        // const students = Array.from({ length: 36 }, (_, i) => `Student ${i + 1}`);
        this.state.students = students;
        this.notifyObservers('populate', this.state)

    }

    clearBoard() {
        this.notifyObservers("clearBoard", null)
    }

    createPreviewSequence() {
        const num_previews = 6;
        const previewSequence = Array.from({ length: num_previews },
            () => Math.floor(Math.random() * this.state.students.length));
        return previewSequence

    }

    selectTiles(mode) {
        this.clearBoard();
        let sequences;
        mode === 'single' ?
            sequences = [this.createPreviewSequence()] :
            sequences = [this.createPreviewSequence(), this.createPreviewSequence()];
        console.log("From selectTiles function:");
        console.log(sequences)
        this.notifyObservers('selectTiles', { mode, sequences });
    }

    groupToColor = {
        0: "lightcoral",
        1: "green",
        2: "yellow",
        3: "orange",
        4: "pink",
        5: "brown",
        6: "lightgrey",
        7: "lightblue"
    }

    mapGroupsToColors(arr) {
        let new_array = []
        for (let i in arr) {
            new_array.push(this.groupToColor[arr[i]])
        }
        return new_array;
    }

    group() {
        this.clearBoard();
        const num_groups = 8;
        const num_students = this.state.students.length;
        // Initialize the groups - to change length: 8 to num_groups
        const groups = Array.from({ length: num_groups }, () => []);
        // Create an array of group indices
        const group_indices = Array.from({ length: num_students }, (_, i) => i);
        // Shuffle the indices to randomize assignment
        const scrambled_group_indices = [...group_indices].sort(() => Math.random() - 0.5);
        // Distribute the indices into groups
        scrambled_group_indices.forEach((index, i) => { groups[i % num_groups].push(index) });
        console.log(scrambled_group_indices)
        // Create the result object
        let result = {};
        group_indices.forEach((_, i) => {
            // Find the group this element belongs to
            const group = groups.findIndex(group => group.includes(i));
            result[i] = group;
        });
        // Only keep the values of the object, order is preserved
        result = Object.values(result);
        // Assign object to 'groups'
        this.state.groups = result;
        const colors = this.mapGroupsToColors(result);
        console.log(this.state.groups)
        const newOrder = this.createNewOrder();
        // Send color-mapped array to observer
        this.notifyObservers('group', { colors, newOrder });

    }

    reset() {
        this.notifyObservers('removeChildren');
        this.notifyObservers('populate', this.state);
    }

    createNewOrder() {
        const groups = this.state.groups
        const groupedIndices = groups.reduce((groups, group, index) => {
            if (!groups[group]) groups[group] = [];
            groups[group].push(index);
            return groups;
        }, {});

        // Step 2: Flatten grouped indices into a single array
        const newOrder = Object.values(groupedIndices).flat();
        return newOrder;

    }

    toggleNavbar() {
        this.notifyObservers("toggle-navbar", null)
    }

    createItems() {
        return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".toLowerCase().split("");
    }
}


class ClassroomObserver {
    constructor() {
        this.studentTiles = []
        this.studentContainer;
        this.index = 0;
        this.lastIndex = 0;
        this.previewSequence = []
        // Check if sequence array out of bounds
        this.canContinuePreview = (index, sequence) => {
            // console.log(index, sequence.length)
            return index < sequence.length
        }
        this.updateIndexes = (lastIndex, index) => {
            lastIndex = index;
            index++;
            console.log(lastIndex, index)
            return [lastIndex, index];
        }


        this.zoomTiles = (tiles, sequences) => {

            if (sequences.length == 2) {
                // If sequences is array of 2 arrays
                // Access last element of sequences and grab tile
                const last_one = [...sequences][0].pop()
                const last_two = [...sequences][1].pop()
                tiles[last_one].classList.remove('select-preview');
                tiles[last_two].classList.remove('select-preview');
                tiles[last_one].classList.add('zoomed-pair', 'zoomed-pair-left');
                tiles[last_two].classList.add('zoomed-pair', 'zoomed-pair-right');

                return [tiles[last_one], tiles[last_two]];
            } else {
                const last = [...sequences].pop();
                // if sequences is simple array
                tiles[last].classList.remove('select-preview');
                tiles[last].classList.add('zoomed');

                return tiles[last];
            }

        }

        this.unzoomTiles = (zoomedTiles) => {
            const handleClickOutside = (event) => {
                if (Array.isArray(zoomedTiles)) {
                    if (!zoomedTiles[0].contains(event.target) && !zoomedTiles[1].contains(event.target)) {
                        zoomedTiles.forEach(tile => tile.classList.remove('zoomed-pair', 'zoomed-pair-left', 'zoomed-pair-right'));
                        document.removeEventListener('click', handleClickOutside);
                    }
                } else {
                    // If zoomedTiles is a single element
                    if (!zoomedTiles.contains(event.target)) {
                        zoomedTiles.classList.remove('zoomed');
                        document.removeEventListener('click', handleClickOutside);
                    }
                }
            };

            // Add the event listener
            document.addEventListener('click', handleClickOutside);
        };

    }
    update(eventType, payload) {
        switch (eventType) {
            case "removeChildren":
                console.log('removeChildren observer initialied...');
                this.studentContainer = document.querySelector(".students-container");
                console.log(this.studentContainer)
                while (this.studentContainer.firstChild) {
                    this.studentContainer.removeChild(this.studentContainer.lastChild);
                }
                break;
            case "populate":

                const { students } = payload;
                const studentsContainer = document.querySelector(".students-container");
                // Populate the grid with student tiles
                students.forEach(student => {
                    const tile = document.createElement("div");
                    tile.classList.add("student-tile");
                    tile.textContent = student;
                    studentsContainer.appendChild(tile);
                });
                break;
            case "clearBoard":
                this.studentTiles = document.querySelectorAll('.student-tile');
                this.studentTiles.forEach((tile, _) => {
                    tile.classList.remove('select-preview');
                    tile.style.removeProperty("background-color");
                });
                break;

            case "selectTiles":
                console.log("case 'selectTiles' observer:")
                const { mode, sequences } = payload;
                let i = 0, j = -1;
                this.studentTiles = document.querySelectorAll('.student-tile');

                const interval = setInterval(() => {
                    // sequences[0] or sequences[1], same
                    if (this.canContinuePreview(i, sequences[0])) {
                        if (i > 0) {
                            // Remove previous selection
                            this.studentTiles[sequences[0][j]].classList.remove('select-preview');
                            if (mode == 'pair') {
                                this.studentTiles[sequences[1][j]].classList.remove('select-preview');
                            }
                        }
                        // Add current selection
                        this.studentTiles[sequences[0][i]].classList.add('select-preview');
                        if (mode == 'pair') {
                            this.studentTiles[sequences[1][i]].classList.add('select-preview');
                        }
                        [j, i] = this.updateIndexes(j, i);
                    } else {
                        // When it gets to the last element of array 'sequence', do this:
                        clearInterval(interval);
                        // sequences[0] because sequences is an array of arrays
                        const payload = mode == 'single' ? sequences[0] : sequences;
                        let zoomedTiles = this.zoomTiles(this.studentTiles, payload);
                        this.unzoomTiles(zoomedTiles);
                    }
                }, 500);
                break;

            case "group":
                const { colors, newOrder } = payload;
                // Select all student tiles
                this.studentTiles = document.querySelectorAll('.student-tile');
                let index = 0;
                let groupingAnimation = setInterval(() => {
                    if (index < this.studentTiles.length) {
                        this.studentTiles[index].classList.add('select-preview-no-color');
                        this.studentTiles[index].style.backgroundColor = colors[index];
                        index++;
                    } else {
                        clearInterval(groupingAnimation);
                        this.studentTiles.forEach(tile => {
                            tile.classList.remove('select-preview-no-color');
                        });

                        setTimeout(() => {
                            // Create a new container for rearranged tiles
                            const parent = document.querySelector('.students-container'); // Replace with your container class
                            newOrder.forEach(index => {
                                parent.appendChild(this.studentTiles[index]);
                            });
                        }, 500);
                    }
                }, 200);

            case "toggle-navbar":
                const navbar = document.querySelector(".navbar");
                navbar.classList.toggle("hidden");

                break;
            default:
                console.log("Unknown event");
        }
    }
}


document.addEventListener("DOMContentLoaded", () => {

    const classroomState = new ClassroomState();
    const students = JSON.parse(localStorage.getItem("students"));
    classroomState.populateBoard(students);

    const classroomObserver = new ClassroomObserver();
    classroomState.addObserver(classroomObserver);



    const selectButton = document.getElementById("random1");
    selectButton.addEventListener("click", () => {
        classroomState.selectTiles('single');
    })

    const select2Button = document.getElementById("random2");
    select2Button.addEventListener("click", () => {
        classroomState.selectTiles('pair');
    })

    const groupButton = document.getElementById("create-groups");
    groupButton.addEventListener("click", () => {
        classroomState.group();
        // classroomState.notifyObservers('group', null)
    })

    const resetButton = document.getElementById("reset");
    resetButton.addEventListener("click", () => {
        classroomState.reset();
        // classroomState.notifyObservers('group', null)
    })

    const toggleButton = document.querySelector(".toggle-navbar");
    // Toggle navbar visibility
    toggleButton.addEventListener("click", () => {
        classroomState.toggleNavbar()
    });

});
