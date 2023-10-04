var quill = new Quill('#textInput', {
    modules: {
        toolbar: false
    },
    theme: 'snow'
});

var badgeData = {};
let isMultipleSelect = false;
let multipleSelections = [];

document.getElementById('multipleSelectToggle').addEventListener('change', function() {
    isMultipleSelect = this.checked;
    if (!isMultipleSelect) {
        // Remove the temporary blue highlight for all selections in the multipleSelections array
        for (let selection of multipleSelections) {
            quill.formatText(selection.index, selection.length, 'background', false);
        }
        multipleSelections = []; // Reset the multiple selections
    }
});

quill.on('selection-change', function(range, oldRange, source) {
    if (range) {
        if (range.length !== 0) {
            if (isMultipleSelect) {
                quill.formatText(range.index, range.length, 'background', '#6495ED');  // Temporary blue color for multiple selection
                multipleSelections.push(range);
            } else {
                colour_level(range);
            }
        }
    }
});

function highlightText() {
    if (isMultipleSelect) {
        quill.format('background', '#6495ED');  // Temporary blue color for multiple selection
    } else {
        colour_level();
    }
}

function underlineText() {
    quill.format('underline', true);
}

function clearFormatting() {
    var selection = quill.getSelection();
    if (selection) {
        quill.removeFormat(selection.index, selection.length);
    } else {
        console.warn('No text selected');
    }
}

// Unsure is this refering drop down menu ??
function colour_level() {
    var selectedOption = document.forms["Colour_selection"]["levels"].value;
    if (selectedOption === 'Level_2') { 
        quill.format('background', '#6278f6');
    } else if (selectedOption === 'Level_3') {
        quill.format('background', '#8596f8');
    } else if (selectedOption === 'Level_4') {
        quill.format('background', '#b9c3fb');
    } else {
        quill.format('background', '#F5F5F5');
    }
}

var currentSubSkill;

function showGrading(subSkill) {
    document.getElementById("commentInput").value = ""; 
    currentSubSkill = subSkill;
    document.getElementById("grading").style.display = "block";
    document.getElementById("commentSection").style.display = "block";
}

function addComment() {
    const commentText = document.getElementById("commentInput").value;
    if (commentText.trim() === "") {
        alert("Please enter a valid comment.");
        return;
    }

    const range = quill.getSelection();
    if (range) {
        const bounds = quill.getBounds(range.index);
        const commentElem = document.createElement('span');
        commentElem.className = 'comment-badge';
        commentElem.textContent = "💬";
        commentElem.title = commentText;
        commentElem.style.bottom = '10px';
        commentElem.style.right = '10px';

        document.querySelector('#textInput').appendChild(commentElem);
        document.getElementById("commentInput").value = "";
    } else {
        console.warn('No text selected');
    }

    document.getElementById("commentSection").style.display = "none";
}

function confirmGrade() {
    var gradeValue = document.getElementById("gradeValue").value;
    var subSkillColor;

    switch(currentSubSkill) {
        case 'Sentence Beginnings':
            subSkillColor = '#FFA500';
            break;
        case 'Propositional Phrase':
            subSkillColor = '#FFB6C1'; 
            break;
        case 'Transition':
            subSkillColor = '#FFD700';
            break;
        case 'Proper Noun':
            subSkillColor = '#ADD8E6';
            break;
        case 'Sub Conjunction':
            subSkillColor = '#FF6347';
            break;
        case 'Pronoun':
            subSkillColor = '#98FB98';
            break;
    }

    if (isMultipleSelect) {
        for (let selection of multipleSelections) {
            quill.formatText(selection.index, selection.length, 'background', subSkillColor);
            if (currentSubSkill === 'Sentence Beginnings') {
                quill.formatText(selection.index, selection.length, 'bold', true);
            }
            addBadgeOverText(gradeValue, subSkillColor, selection); 
        }
        multipleSelections = [];
        quill.format('background', subSkillColor); // Reset the general background to default
    }
     else {
        // existing logic for single selection
        const range = quill.getSelection();
        if (range) {
            quill.format('background', subSkillColor);
            if (currentSubSkill === 'Sentence Beginnings') {
                quill.format('bold', true);
            }
            addBadgeOverText(gradeValue, subSkillColor, range);
        }
    }

    // Hide the grade selector after confirming
    gradeSelector.style.display = "none";
    multipleSelections = []; // Reset the multiple selections

    addBadgeOverText(gradeValue, subSkillColor); 

    document.getElementById("grading").style.display = "none";
    document.getElementById("commentSection").style.display = "none";
}

function addBadgeOverText(gradeValue, subSkillColor, range) {
    const quillContainer = document.querySelector('#textInput');
    const bounds = quill.getBounds(range.index);

    const badgeElem = document.createElement('span');
    badgeElem.className = 'badge';
    badgeElem.textContent = gradeValue;
    badgeElem.style.backgroundColor = subSkillColor;
    badgeElem.style.position = "absolute"; // Ensure positioning is absolute
    badgeElem.style.top = `${bounds.top}px`;
    badgeElem.style.left = `${bounds.left + bounds.width}px`;

    const rangeIndex = JSON.stringify(range);
    badgeElem.setAttribute('data-range-index', rangeIndex);
    quillContainer.appendChild(badgeElem);

    const subSkillButton = document.querySelector(`button[data-subskill="${currentSubSkill}"]`);
    const badgeCopy = document.createElement('span');
    badgeCopy.className = 'badge badge-next-to-button';
    badgeCopy.textContent = gradeValue;
    badgeCopy.style.backgroundColor = subSkillColor;
    badgeCopy.setAttribute('data-range-index', rangeIndex);
    badgeCopy.onclick = function() {
        console.log('Badge clicked');
        const alreadySelected = this.classList.toggle('selected');
        const range = JSON.parse(this.getAttribute('data-range-index'));
        console.log('Range:', range);
        if (alreadySelected) {
            console.log('Highlighting selected text');
            highlightSelected(range, subSkillColor);
        } else {
            console.log('Unhighlighting selected text');
            unhighlightSelected(range, subSkillColor);
        }
    };

    subSkillButton.parentNode.insertBefore(badgeCopy, subSkillButton.nextSibling);

    badgeData[rangeIndex] = {
        badge: badgeElem,
        badgeCopy: badgeCopy,
        range: range,
    };
}

function clearBadge() {
    const quillContainer = document.querySelector('#textInput');
    const rangeIndex = quill.getSelection().index;
    const badgeToRemove = quillContainer.querySelector(`.badge[data-range-index="${rangeIndex}"]`);
    const badgeNextToButton = document.querySelector(`.badge-next-to-button[data-range-index="${rangeIndex}"]`);
    if (badgeToRemove) {
        badgeToRemove.remove();
    }
    if (badgeNextToButton) {
        badgeNextToButton.remove();
    }
}

function clearSubSkillFormatting() {
    var range = quill.getSelection();
    if (range) {
        var rangeIndex = JSON.stringify(range);
        var data = badgeData[rangeIndex];
        if (data) {
            quill.removeFormat(data.range.index, data.range.length);
            data.badge.remove();
            data.badgeCopy.remove();
            delete badgeData[rangeIndex];
        } else {
            console.warn('No badge data found for selected range');
        }
    } else {
        var selectedBadge = document.querySelector('.badge-next-to-button.selected');
        if (selectedBadge) {
            var rangeIndex = selectedBadge.getAttribute('data-range-index');
            var data = badgeData[rangeIndex];
            if (data) {
                quill.removeFormat(data.range.index, data.range.length);
                data.badge.remove();
                data.badgeCopy.remove();
                delete badgeData[rangeIndex];
            } else {
                console.warn('No badge data found for selected badge');
            }
        } else {
            console.warn('No text selected');
        }
    }
}

function clearBadgeByClickingOnIt(range) {
    const quillContainer = document.querySelector('#textInput');
    const rangeIndex = range.index;
    const badgeToRemove = quillContainer.querySelector(`.badge[data-range-index="${rangeIndex}"]`);
    const badgeNextToButton = document.querySelector(`.badge-next-to-button[data-range-index='${JSON.stringify(range)}']`);
    if (badgeToRemove) {
        badgeToRemove.remove();
    }
    if (badgeNextToButton) {
        badgeNextToButton.remove();
    }
    if (badgeData[rangeIndex]) {
        delete badgeData[rangeIndex];
    }
}

function clearAllSubSkillFormatting() {
    const quillContainer = document.querySelector('#textInput');
    const badgesToRemove = document.querySelectorAll('.badge, .badge-next-to-button');
    badgesToRemove.forEach(badge => badge.remove());
    quill.removeFormat(0, quill.getLength());
}

function highlightSelected(range, subSkillColor) {
    const quillContainer = document.querySelector('#textInput');
    const badge = quillContainer.querySelector(`.badge[data-range-index='${JSON.stringify(range)}']`);
    if (badge) {
        badge.classList.add('selected');
    }
    quill.formatText(range.index, range.length, 'background', subSkillColor);
    quill.formatText(range.index, range.length, 'underline', 'red');
}

function unhighlightSelected(range, subSkillColor) {
    const quillContainer = document.querySelector('#textInput');
    const badge = quillContainer.querySelector(`.badge[data-range-index='${JSON.stringify(range)}']`);
    if (badge) {
        badge.classList.remove('selected');
    }
    quill.formatText(range.index, range.length, 'background', subSkillColor);
    quill.formatText(range.index, range.length, 'underline', false);

    document.getElementById("commentSection").style.display = "none";
}

function updateTextArea() {
    var content = quill.root.innerHTML;
    document.getElementById("annotatedtext").value = content;
}
