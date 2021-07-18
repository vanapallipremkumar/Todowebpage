const darkModeIconEl = document.getElementById("darkModeIconEl");
const todoTitleInputEl = document.getElementById("todoTitleInputEl");
const addDescriptionButtonEl = document.getElementById("addDescriptionButtonEl");
const todoDescriptionInputEl = document.getElementById("todoDescriptionInputEl");
const addTodoButtonEl = document.getElementById("addTodoButtonEl");
const saveTodoButtonEl = document.getElementById("saveTodoButtonEl");
const todoListContanerEl = document.getElementById("todoListContanerEl");
const emptyInputEl = document.getElementById("emptyInputEl");
const undoTodoIconEl = document.getElementById("undoTodoIconEl");
const undoDescriptionEl = document.getElementById("undoDescriptionEl");
const progressBarCompletedEl = document.getElementById("progressBarCompleted");
const progressBarUnCompletedEl = document.getElementById("progressBarUnCompleted");
const progressBarContainerEl = document.getElementById("progressBarContainer");
const trashIconEl = document.getElementById("trashIconEl");
const todosContainerEl = document.getElementById("todosContainerEl");
const trashContainerEl = document.getElementById("trashContainerEl");
const trashListContanerEl = document.getElementById("trashListContanerEl");
const restoreAllIconEl = document.getElementById("restoreAllIconEl");
const trashIconToolTip = document.getElementById("trashIconToolTip");
const clearTrashIconEl = document.getElementById("clearTrashIconEl");
const searchTodoEl = document.getElementById("searchTodoEl");

let canIAddDescription = false;
let pageInTrash = false;
// load data from local storage
const darkMode = localStorage.getItem("Theme");
let createdTodosCount = localStorage.getItem("createdTodosCount");
// update created todos count from local storage
createdTodosCount = createdTodosCount === null ? 0 : parseInt(createdTodosCount);

let todosList = localStorage.getItem("todos");
let trashList = localStorage.getItem("trashList");
let undoTodoList = [];

// assign empty array if local storage has no todos
todosList = todosList === null ? [] : JSON.parse(todosList);
trashList = trashList === null ? [] : JSON.parse(trashList);

// load todos from localStorage
createTodoItems(todosList, todoListContanerEl);

if (darkMode === "Dark") {
    document.body.classList.add("dark-theme");
    darkModeIconEl.setAttribute("class", "fas fa-moon icon");
} else {
    localStorage.setItem("Theme", "Light");
}

darkModeIconEl.addEventListener("click", function() {
    onDarkModeIconClick();
});

trashIconEl.addEventListener("click", function() {
    trashIconEl.classList.toggle("fa-home");
    trashIconEl.classList.toggle("fa-trash");
    todosContainerEl.classList.toggle("d-none");
    trashContainerEl.classList.toggle("d-none");
    searchTodoEl.value = "";
    pageInTrash = pageInTrash ? false : true;
    if (pageInTrash) {
        trashIconToolTip.title = "Goto Home";
        createTodoItems(trashList, trashListContanerEl, true);
    } else {
        trashIconToolTip.title = "Goto Trash";
        createTodoItems(sortTodoListByKey(todosList, "id"), todoListContanerEl);
    }
});

restoreAllIconEl.addEventListener("click", function() {
    todosList.push(...trashList);
    trashList = [];
    undoTodoList = [];
    trashListContanerEl.textContent = "";
    onSaveTodoButtonClick();
});
clearTrashIconEl.addEventListener("click", function() {
    trashList = [];
    trashListContanerEl.textContent = "";
    onSaveTodoButtonClick();
});
todoTitleInputEl.addEventListener("change", function() {
    onAddTodoButtonClick();
});
addDescriptionButtonEl.addEventListener("click", function() {
    onAddDescriptionButtonClick();
});

addTodoButtonEl.addEventListener("click", function() {
    onAddTodoButtonClick();
});

saveTodoButtonEl.addEventListener("click", function() {
    onSaveTodoButtonClick();
});

undoTodoIconEl.addEventListener("click", function() {
    onUndoTodoIconClick();
});

searchTodoEl.addEventListener("search", function() {
    const value = searchTodoEl.value.trim();
    if (value === "") {
        createTodoItems(todosList, todoListContanerEl);
    }
});
searchTodoEl.addEventListener("keyup", function() {
    const value = searchTodoEl.value.trim().toLowerCase();
    let searchedTodoList = [];
    for (let todo of todosList) {
        const title = todo.title.toLowerCase();
        if (title.includes(value)) {
            searchedTodoList.push(todo);
        }
    }
    if (searchedTodoList !== []) {
        createTodoItems(searchedTodoList, todoListContanerEl);
    }
});

function onDarkModeIconClick() {
    document.body.classList.toggle("dark-theme");
    if (localStorage.getItem("Theme") === "Light") {
        localStorage.setItem("Theme", "Dark");
        darkModeIconEl.setAttribute("class", "fas fa-moon icon");
    } else {
        localStorage.setItem("Theme", "Light");
        darkModeIconEl.setAttribute("class", "fas fa-sun icon light-theme-icon");
    }
}

function onAddDescriptionButtonClick() {
    todoDescriptionInputEl.classList.toggle("d-none");
    canIAddDescription = !canIAddDescription;
    if (canIAddDescription) {
        addDescriptionButtonEl.textContent = "Remove Description";
    } else {
        addDescriptionButtonEl.textContent = "Add Description";
    }
}

function onAddTodoButtonClick() {
    let titleValue = todoTitleInputEl.value.trim();
    let descriptionValue = todoDescriptionInputEl.value.trim();
    todoTitleInputEl.value = "";
    todoDescriptionInputEl.value = "";
    if (titleValue !== "") {
        createdTodosCount = createdTodosCount + 1;
        let todoData = {
            checked: false,
            columnId: "columnId" + createdTodosCount,
            description: descriptionValue,
            hasDescription: canIAddDescription,
            id: createdTodosCount,
            title: titleValue,
        };
        if (todoData.hasDescription === false || descriptionValue === "") {
            todoData.description = "Description not mentioned";
        }
        todosList.push(todoData);
        createAndAppend(todoData, todoListContanerEl);
        addTodoButtonEl.textContent = "Added";
        setTimeout(function() {
            addTodoButtonEl.textContent = "+ Add";
        }, 1000);
        updateProgressBar();
    } else {
        emptyInputEl.textContent = "* Title Must be Non-Empty";
        setTimeout(function() {
            emptyInputEl.textContent = "";
        }, 2000);
    }
}

function onSaveTodoButtonClick() {
    localStorage.setItem("createdTodosCount", createdTodosCount);
    localStorage.setItem("todos", JSON.stringify(todosList));
    localStorage.setItem("trashList", JSON.stringify(trashList));
    saveTodoButtonEl.textContent = "Saved";
    setTimeout(function() {
        saveTodoButtonEl.textContent = "Save";
    }, 1000);
}

function onUndoTodoIconClick() {
    if (undoTodoList.length === 0) {
        undoDescriptionEl.textContent = "No more items found";
        setTimeout(() => {
            undoDescriptionEl.textContent = "";
        }, 2000);
        return;
    }
    const lastDeletedItem = undoTodoList.pop();
    trashList.pop();
    todosList.push(lastDeletedItem);
    todosList = sortTodoListByKey(todosList, "id");
    createTodoItems(todosList, todoListContanerEl);
}

function createTodoItems(todosList, todoListContanerEl, forTrash = false) {
    todoListContanerEl.textContent = "";
    for (let todo of todosList) {
        createAndAppend(todo, todoListContanerEl, forTrash);
    }
    updateProgressBar();
}

// function to append todo item to column container
function createAndAppend(todoData, todoListContanerEl, forTrash = false) {
    //creating elements
    let columnContainer = document.createElement("div");
    columnContainer.id = todoData.columnId;
    columnContainer.setAttribute("class", "col-12 col-md-5 p-0 mb-4 mr-md-5");

    let todoContainer = document.createElement("div");
    todoContainer.id = "todoContainerId" + todoData.id;
    todoContainer.setAttribute("class", "d-flex flex-row justify-content-between nmfm-border-shadow-outside todo-container p-2");

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "checkboxId" + todoData.id;
    checkbox.checked = todoData.checked;

    let todoDataContainer = document.createElement("div");
    todoDataContainer.id = "todoDataContainerId" + todoData.id;
    todoDataContainer.setAttribute("class", "d-flex flex-column todo-data-container");

    let todoTitle = document.createElement("h3");
    todoTitle.id = "todoTitleId" + todoData.id;
    todoTitle.setAttribute("class", "todo-title");
    todoTitle.textContent = todoData.title;

    let todoDescription = document.createElement("p");
    todoDescription.id = "todoDescriptionId" + todoData.id;
    todoDescription.setAttribute("class", "todo-description d-none");
    todoDescription.textContent = todoData.description;

    let restoreIcon = document.createElement("i");
    restoreIcon.id = "trashIconId" + todoData.id;
    restoreIcon.setAttribute("class", "fas fa-undo icon operation-icon restore-icon-small");

    let deleteIcon = document.createElement("i");
    deleteIcon.id = "deleteIconId" + todoData.id;
    deleteIcon.setAttribute("class", "far fa-trash-alt operation-icon");

    // event listeners

    restoreIcon.addEventListener("click", function() {
        const indexOfTrashList = getIndexByIdNumber(trashList, todoData.id);
        const indexOfUndoList = getIndexByIdNumber(undoTodoList, todoData.id);
        const todoItem = trashList[indexOfTrashList];
        todosList.push(trashList[indexOfTrashList]);
        trashList.splice(indexOfTrashList, 1);
        undoTodoList.splice(indexOfUndoList, 1);
        trashListContanerEl.removeChild(columnContainer);
    });

    deleteIcon.addEventListener("click", function() {
        if (forTrash) {
            trashListContanerEl.removeChild(columnContainer);
            deleteFromTrashList(todoData.id);
        } else {
            todoListContanerEl.removeChild(columnContainer);
            deleteFromTodoList(todoData.id);
        }
    });

    todoTitle.addEventListener("click", function() {
        todoDescription.classList.toggle("d-none");
    });

    checkbox.addEventListener("click", function() {
        if (forTrash) {
            updateCheckBoxInTodoList(trashList, todoData.id);
        } else {
            updateCheckBoxInTodoList(todosList, todoData.id);
        }
    });

    // appending childs to containers
    todoDataContainer.appendChild(todoTitle);
    todoDataContainer.appendChild(todoDescription);

    todoContainer.appendChild(checkbox);
    todoContainer.appendChild(todoDataContainer);
    if (forTrash) {
        todoContainer.appendChild(restoreIcon);
    }
    todoContainer.appendChild(deleteIcon);

    columnContainer.appendChild(todoContainer);

    todoListContanerEl.appendChild(columnContainer);
}

function getIndexByIdNumber(data, idNumber) {
    return data.findIndex(function(todo) {
        return todo.id === idNumber;
    });
}

function updateCheckBoxInTodoList(todosList, idNumber) {
    let index = getIndexByIdNumber(todosList, idNumber);
    let isChecked = todosList[index].checked;
    todosList[index].checked = !isChecked;
    updateProgressBar();
    onSaveTodoButtonClick();
}

// function to delete todo item with idNumber
function deleteFromTodoList(idNumber) {
    let index = getIndexByIdNumber(todosList, idNumber);
    if (index !== -1) {
        trashList.push(todosList[index]);
        undoTodoList.push(todosList[index]);
    }
    todosList.splice(index, 1);
    updateProgressBar();
}

function deleteFromTrashList(idNumber) {
    let index = getIndexByIdNumber(trashList, idNumber);
    trashList.splice(index, 1);
    undoTodoList.splice(index, 1);
}

function sortTodoListByKey(todosList, key) {
    todosList.sort((currentTodo, nextTodo) => {
        const id1 = currentTodo[key];
        const id2 = nextTodo[key];
        return id1 === id2 ? 0 : id1 < id2 ? -1 : 1;
    });
    return todosList;
}

function updateProgressBar() {
    let checkedTodosCount = 0;
    let totalTodosCount = 0
    for (let todo of todosList) {
        checkedTodosCount += (todo.checked ? 1 : 0);
        totalTodosCount += 1;
    }
    if (totalTodosCount === 0) {
        progressBarContainerEl.classList.add("d-none");
    } else {
        progressBarContainerEl.classList.remove("d-none");
    }
    const completedTodosPercentage = Math.ceil((checkedTodosCount / totalTodosCount) * 100);
    const uncompletedTodosPercentage = 100 - completedTodosPercentage;

    progressBarCompleted.style.width = completedTodosPercentage + "%";
    progressBarCompleted.textContent = completedTodosPercentage > 0 ? completedTodosPercentage + "%" : "";

    progressBarUnCompleted.style.width = uncompletedTodosPercentage + "%";
    progressBarUnCompleted.textContent = uncompletedTodosPercentage > 0 ? uncompletedTodosPercentage + "%" : "";
}
