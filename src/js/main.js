const arrival = {
    date: null,
    element: null,
    month: null,
    year: null
};

const departure = {
    date: null,
    element: null,
    month: null,
    year: null
};

const leftMonth = {
    month: null,
    year: null
};

const rightMonth = {
    month: null,
    year: null
};

const months = {
    leftMonth: null,
    rightMonth: null,
    leftYear: null,
    rightYear: null
};

$(document).ready(() => {
    renderDateValue({
        inputId: "now__date"
    });
    renderDateValue({
        inputId: "next__date",
        isNextDay: true
    });

    subscribeToClickAndSwitchCalendarStatus(".control__in");
    subscribeToClickAndSwitchCalendarStatus(".control__out");

    showTableCalendar(0, "left__month__name", "left__month__element", arrival, departure);
    showTableCalendar(1, "right__month__name", "right__month__element", arrival, departure);

    switchArrivalDate("now__date", arrival);
    switchDepartureDate(arrival, departure);

    clickOnNextArrow();
    clickOnPrevArrow();
});

function renderDateValue({ inputId, isNextDay = false }) {
    const now = new Date();
    let day = now.getDate() + (isNextDay ? 1 : 0);
    let month = now.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    const today = now.getFullYear() + "-" + month + "-" + day;
    const date = document.getElementById(inputId);
    if (!date) {
        return;
    }
    date.value = today;
}

function subscribeToClickAndSwitchCalendarStatus(controlClassName) {
    $(controlClassName).click(function() {
        $("div.calendar").fadeToggle("fast", function() {
            if ($(this).is(":visible")) {
                $(this).css("display", "inline-block");
            }
        });
        return false;
    });
    $(".day").click(function() {
        $("div.calendar").fadeOut("fast", function() {
            if ($(this).is(":visible")) {
                $(this).css("display", "none");
            }
        });
        return false;
    });
}

function clickOnNextArrow() {
    const arrow = document.getElementById("next__arrow");
    arrow.onclick = function() {
        months.leftMonth = months.rightMonth;
        months.leftYear = months.rightYear;
        if (months.rightMonth === 11) {
            months.rightMonth = 0;
            months.rightYear = months.rightYear + 1;
        } else {
            months.rightMonth = months.rightMonth + 1;
        }
        let leftMonthName = document.getElementById("left__month__name");
        let rightMonthName = document.getElementById("right__month__name");
        const namesOfMonths = [
            "Январь",
            "Февраль",
            "Март",
            "Апрель",
            "Май",
            "Июнь",
            "Июль",
            "Август",
            "Сентябрь",
            "Октябрь",
            "Ноябрь",
            "Декабрь"
        ];
        const numberOfDaysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if ((leftMonth.year % 4 === 0 && leftMonth.year % 100 != 0) || leftMonth.year % 400 === 0) {
            numberOfDaysInMonths[1] = 29;
        }

        leftMonth.month = rightMonth.month;
        rightMonth.month = rightMonth.month + 1;
        leftMonth.year = rightMonth.year;
        if (rightMonth.month > 11) {
            rightMonth.year++;
            rightMonth.month = 0;
        }

        leftMonthName.innerHTML = namesOfMonths[leftMonth.month] + " " + leftMonth.year;
        rightMonthName.innerHTML = namesOfMonths[rightMonth.month] + " " + rightMonth.year;

        {
            $(".month__element__prev").removeClass("month__element__arrow--disabled");
            $(".day__element").each(function(_, element) {
                element.classList.remove("day__element--active");
            });
        }

        const daysInMonth = numberOfDaysInMonths[leftMonth.month];
        const firstDayInMonth = new Date(leftMonth.year, leftMonth.month, 1);
        const firstWeekDay = firstDayInMonth.getDay();

        const monthElement = document.getElementById("left__month__element");
        for (let i = 1; i < daysInMonth; i++) {
            const calendarCell = monthElement.getElementsByTagName("a");
            if (i === firstWeekDay) {
                for (let j = 0; j < daysInMonth; j++) {
                    calendarCell[i + j - 1].innerHTML = 1 + j;
                }
            }
        }

        cleanTable("left__month__element");
        cleanTable("right__month__element");
        drawTable(numberOfDaysInMonths, leftMonth.month, leftMonth.year, "left__month__element");
        drawTable(numberOfDaysInMonths, rightMonth.month, rightMonth.year, "right__month__element");
    };
}

function drawTable(numberOfDaysInMonths, month, year, monthId) {
    const daysInMonth = numberOfDaysInMonths[month];
    const firstDayInMonth = new Date(year, month, 1);
    let firstWeekDay = firstDayInMonth.getDay();
    if (firstWeekDay === 0) {
        firstWeekDay = 7;
    }

    const monthElement = document.getElementById(monthId);
    const calendarCell = monthElement.getElementsByClassName("day__element");
    for (let i = 1; i < daysInMonth; i++) {
        if (i === firstWeekDay) {
            for (let j = 0; j < daysInMonth; j++) {
                calendarCell[i + j - 1].innerHTML = 1 + j;
            }
        }
        if (
            parseInt(arrival.month) === month &&
            arrival.year === year &&
            arrival.element === monthId
        ) {
            if (i === parseInt(arrival.date)) {
                calendarCell[i - 1].classList.add("day__element--active");
            }
        }
    }
}

function cleanTable(monthId) {
    const monthElement = document.getElementById(monthId);
    const calendarCell = monthElement.getElementsByTagName("a");
    for (let i = 0; i < calendarCell.length; i++) {
        $(".day__element").removeClass("day__element--active");
        calendarCell[i].innerHTML = null;
    }
}

function clickOnPrevArrow() {
    const arrow = document.getElementById("prev__arrow");
    arrow.onclick = function() {
        months.rightMonth = months.leftMonth;
        months.rightYear = months.leftYear;
        if (months.leftMonth === 11) {
            months.leftMonth = 0;
            months.leftYear = months.leftYear + 1;
        } else {
            months.leftMonth = months.leftMonth + 1;
        }
        let leftMonthName = document.getElementById("left__month__name");
        let rightMonthName = document.getElementById("right__month__name");
        const namesOfMonths = [
            "Январь",
            "Февраль",
            "Март",
            "Апрель",
            "Май",
            "Июнь",
            "Июль",
            "Август",
            "Сентябрь",
            "Октябрь",
            "Ноябрь",
            "Декабрь"
        ];
        const numberOfDaysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if ((leftMonth.year % 4 === 0 && leftMonth.year % 100 != 0) || leftMonth.year % 400 === 0) {
            numberOfDaysInMonths[1] = 29;
        }

        rightMonth.month = leftMonth.month;
        rightMonth.year = leftMonth.year;
        leftMonth.month = leftMonth.month - 1;
        if (leftMonth.month < 0) {
            leftMonth.year--;
            leftMonth.month = 11;
        }

        leftMonthName.innerHTML = namesOfMonths[leftMonth.month] + " " + leftMonth.year;
        rightMonthName.innerHTML = namesOfMonths[rightMonth.month] + " " + rightMonth.year;

        const now = new Date();
        if (
            parseInt(now.getMonth()) + 1 === rightMonth.month &&
            now.getFullYear() === rightMonth.year
        )
        
        $(".month__element__prev").addClass("month__element__arrow--disabled");
        $(".day__element").each(function(_, element) {
            console.log(element.innerHTML, arrival.date);
            if (element.innerHTML === arrival.date) {
                $(element).addClass("day__element--active");
            }
        })

        cleanTable("left__month__element");
        cleanTable("right__month__element");
        drawTable(numberOfDaysInMonths, leftMonth.month, leftMonth.year, "left__month__element");
        drawTable(numberOfDaysInMonths, rightMonth.month, rightMonth.year, "right__month__element");
    };
}

function showTableCalendar(count, monthId, elementId, arrival, departure) {
    const date = new Date();
    const month = date.getMonth() + count;
    const fullYear = date.getFullYear();
    const namesOfMonths = [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь"
    ];
    const numberOfDaysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if ((fullYear % 4 === 0 && fullYear % 100 != 0) || fullYear % 400 === 0) {
        numberOfDaysInMonths[1] = 29;
    }

    document.getElementById(monthId).innerHTML = namesOfMonths[month] + " " + fullYear;
    if (monthId === "left__month__name") {
        leftMonth.month = month;
        leftMonth.year = fullYear;
    } else {
        rightMonth.month = month;
        rightMonth.year = fullYear;
    }

    const daysInMonth = numberOfDaysInMonths[month];
    const firstDayInMonth = new Date(fullYear, month, 1);
    const firstWeekDay = firstDayInMonth.getDay();

    const monthElement = document.getElementById(elementId);
    for (let i = 1; i < daysInMonth; i++) {
        const calendarCell = monthElement.getElementsByTagName("a");
        if (i === firstWeekDay) {
            for (let j = 0; j < daysInMonth; j++) {
                calendarCell[i + j - 1].innerHTML = 1 + j;
            }
        }
    }

    const day = date.getDate();
    arrival.date = day;
    arrival.element = "left__month__element";
    arrival.month = month;
    arrival.year = fullYear;
    if (parseInt(day + 1) != numberOfDaysInMonths[parseInt(month)]) {
        departure.date = day + 1;
        departure.element = "left__month__element";
        departure.month = month;
        departure.year = fullYear;
    } else {
        departure.date = 1;
        departure.element = "right__month__element";
        departure.month = month + 1;
        if (month + 1 > 11) {
            departure.month = 1;
            departure.year = fullYear + 1;
        } else {
            departure.month = month;
            departure.year = fullYear;
        }
    }

    months.leftMonth = month;
    months.leftYear = fullYear;
    if (month === 11) {
        months.rightMonth = 0;
        months.rightYear = fullYear + 1;
    } else {
        months.rightMonth = month + 1;
        months.rightYear = fullYear;
    }

    {
        const container = document.getElementById("left__month__element");
        const calendarCells = container.getElementsByTagName("a");

        const day = new Date();

        for (let i = 0; i < day.getDate() - 1; i++) {
            calendarCells[i].classList.add("day__element--disabled-permanently");
        }

        // for (let i = 0; i < day.getDate(); i++) {
        //     if (calendarCells[i].innerHTML == parseInt(arrival.date)) {
        //         calendarCells[i].classList.add("day__element--active");
        //     }
        // }
    }

    {
        $(".month__element__prev").addClass("month__element__arrow--disabled");
    }
}

function switchArrivalDate(dateId, arrival) {
    const input = document.getElementById("control__in");
    input.onclick = function() {
        {
            const container = document.getElementById("left__month__element");
            const calendarCells = container.getElementsByTagName("a");
            for (const calendarCell of calendarCells) {
                calendarCell.classList.remove("day__element--disabled");
                calendarCell.classList.remove("day__element--active");
                calendarCell.classList.remove("day__element--selected");
                calendarCell.classList.remove("day__element--first-selected");
            }
        }
        {
            const container = document.getElementById("right__month__element");
            const calendarCells = container.getElementsByTagName("a");
            for (const calendarCell of calendarCells) {
                calendarCell.classList.remove("day__element--disabled");
                calendarCell.classList.remove("day__element--active");
                calendarCell.classList.remove("day__element--selected");
                calendarCell.classList.remove("day__element--first-selected");
            }
        }
        findDay("left__month__element", dateId, arrival);
        findDay("right__month__element", dateId, departure);
    };
}

function findDay(elementId, dateId, dateState) {
    const arrivalContainer = document.getElementById(dateState.element);
    const arrivalCalendarCells = arrivalContainer.getElementsByTagName("a");
    for (const calendarCell of arrivalCalendarCells) {
        calendarCell.classList.remove("day__element--active");
        const isArrivalDate = dateState.date === parseInt(calendarCell.innerHTML);
        if (isArrivalDate) {
            calendarCell.classList.add("day__element--active");
        }
    }
    const date = new Date();
    date.setDate(parseInt(dateState.date));

    let month;

    const container = document.getElementById(elementId);
    const calendarCells = container.getElementsByTagName("a");
    for (const calendarCell of calendarCells) {
        calendarCell.onclick = function() {
            if (elementId === "left__month__element") {
                month = months.leftMonth;
                fullYear = months.leftYear;
            } else {
                month = months.rightMonth;
                fullYear = months.rightYear;
            }
            let day = this.innerHTML;
            const numberOfDaysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if ((fullYear % 4 === 0 && fullYear % 100 != 0) || fullYear % 400 === 0) {
                numberOfDaysInMonths[1] = 29;
            }
            if (day < 10) {
                day = "0" + day;
            }

            if (month < 10) {
                month = "0" + month;
            }
            setCloseDate(day, elementId);
            if (day != dateState.date || elementId != dateState.element) {
                setCloseDate(dateState.date, dateState.element);
            }

            dateState.date = day;
            dateState.element = elementId;
            dateState.month = month;
            dateState.year = fullYear;

            const today = fullYear + "-" + month + "-" + day;
            const dateElement = document.getElementById(dateId);
            if (!dateElement) {
                return;
            }
            dateElement.value = today;
            const depDay = new Date(fullYear, month - 1, day);
            const date = new Date(departure.year, parseInt(departure.month) - 1, departure.date);
            console.log(depDay, date);
            if (depDay > date) {
                setDepartureDate(fullYear, month, day, elementId);
            }
        };
    }
}

function setDepartureDate(fullYear, month, day, elementId) {
    const numberOfDaysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if ((fullYear % 4 === 0 && fullYear % 100 != 0) || fullYear % 400 === 0) {
        numberOfDaysInMonths[1] = 29;
    }
    if (parseInt(day) != numberOfDaysInMonths[parseInt(month) - 1]) {
        day = parseInt(day) + 1;
        departure.element = elementId;
    } else {
        day = 1;
        month++;
        if (month < 10) {
            month = "0" + month;
        }
        if (elementId === "left__month__element") {
            departure.element = "right__month__element";
        } else {
            departure.element = "left__month__element";
        }
    }
    if (day < 10) {
        day = "0" + day;
    }
    departure.date = day;
    departure.month = parseInt(month);
    departure.year = fullYear;
    const departureDate = fullYear + "-" + month + "-" + day;
    const dateElement = document.getElementById("next__date");
    if (!dateElement) {
        return;
    }
    console.log(departure);
    dateElement.value = departureDate;
}

function switchDepartureDate(arrival, departure) {
    const input = document.getElementById("control__out");
    input.onclick = function() {
        const today = new Date();
        let arrivalDay;
        if (arrival.element === "left__month__element") {
            arrivalDay = new Date(today.getFullYear(), today.getMonth(), arrival.date);
        } else {
            arrivalDay = new Date(today.getFullYear(), today.getMonth() + 1, arrival.date);
        }

        {
            const arrivalContainer = document.getElementById("left__month__element");
            const arrivalCalendarCells = arrivalContainer.getElementsByTagName("a");
            for (const calendarCell of arrivalCalendarCells) {
                calendarCell.classList.remove("day__element--active");
            }
        }

        const arrivalContainer = document.getElementById(arrival.element);
        const arrivalCalendarCells = arrivalContainer.getElementsByTagName("a");
        for (const calendarCell of arrivalCalendarCells) {
            const isArrivalDate = arrival.date === parseInt(calendarCell.innerHTML);
            if (isArrivalDate && departure.element !== "right__month__element") {
                for (let i = arrival.date; i < departure.date; i++) {
                    arrivalCalendarCells[i].classList.add("day__element--active");
                }
            }
            if (departure.element === "right__month__element") {
                for (let i = arrival.date; i < arrivalCalendarCells.length; i++) {
                    arrivalCalendarCells[i].classList.add("day__element--active");
                }
            }
        }

        {
            const departureContainer = document.getElementById("right__month__element");
            const departureCalendarCells = departureContainer.getElementsByTagName("a");
            for (const calendarCell of departureCalendarCells) {
                calendarCell.classList.remove("day__element--active");
            }
        }

        if (departure.element === "right__month__element") {
            const departureContainer = document.getElementById(departure.element);
            const departureCalendarCells = departureContainer.getElementsByTagName("a");
            for (const calendarCell of departureCalendarCells) {
                const isDepartureDate = departure.date === parseInt(calendarCell.innerHTML);
                if (isDepartureDate) {
                    const date = new Date();
                    date.setMonth(date.getMonth() + 1);
                    date.setDate(1);

                    for (let i = 0; i < parseInt(departure.date) + date.getDay() - 1; i++) {
                        departureCalendarCells[i].classList.add("day__element--active");
                    }
                }
            }
        }

        clickOnCell("left__month__element", today, departure);
        clickOnCell("right__month__element", today, departure);
        disableDatesUntilCurrent(arrivalDay, arrival.element);
    };
}

function disableDatesUntilCurrent(day, elementId) {
    const container = document.getElementById(elementId);
    const calendarCells = container.getElementsByTagName("a");

    const isRightCalendarPart = elementId === "right__month__element";
    if (isRightCalendarPart) {
        const leftContainer = document.getElementById("left__month__element");
        const leftContainerCells = leftContainer.getElementsByTagName("a");
        const date = new Date();
        const firstDayOfNextMonth = new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
        );
        const firstWeekdayInMonth = firstDayOfNextMonth.getDay() - 1;

        for (let i = 0; i < 31 + firstWeekdayInMonth; i++) {
            leftContainerCells[i].classList.add("day__element--disabled");
        }
        const rightContainer = document.getElementById("right__month__element");
        const rightContainerCells = rightContainer.getElementsByTagName("a");
        for (let i = 0; i < day.getDate() + firstWeekdayInMonth; i++) {
            rightContainerCells[i].classList.add("day__element--disabled");
            rightContainerCells[i].classList.remove("day__element--active");
        }
    } else {
        for (let i = 0; i < day.getDate(); i++) {
            calendarCells[i].classList.add("day__element--disabled");
        }
    }
    const firstDay = day.getDate();
    for (let i = 0; i < parseInt(firstDay) + 5; i++) {
        if (firstDay === calendarCells[i].innerHTML) {
            calendarCells[i].classList.add("day__element--first-selected");
            calendarCells[i + 1].classList.add("day__element--active");
            calendarCells[i + 1].classList.remove("day__element--disabled");
        }
    }
}

function clickOnCell(elementId, today, departure) {
    let month = today.getMonth();
    if (elementId === "left__month__element") {
        month = today.getMonth();
    } else {
        month = today.getMonth() + 1;
    }
    month++;
    let fullYear = today.getFullYear();
    let table = document.getElementById(elementId);
    let cells = table.getElementsByTagName("a");
    for (let i = 0, len = cells.length; i < len; i++) {
        cells[i].onclick = function() {
            let day = this.innerHTML;
            setCloseDate(day, elementId);
            if (day != departure.date || elementId != departure.element) {
                setCloseDate(departure.date, departure.element);
            }
            departure.date = day;
            departure.element = elementId;
            if (day < 10) {
                day = "0" + day;
            }
            if (month < 10) {
                month = "0" + month;
            }
            let today = fullYear + "-" + month + "-" + day;
            let dateElement = document.getElementById("next__date");
            if (!dateElement) {
                return;
            }
            dateElement.value = today;
        };
    }
}

function setCloseDate(day, elementId) {
    const container = document.getElementById(elementId);
    const calendarCells = container.getElementsByTagName("a");
    for (let i = 0; i < parseInt(day) + 5; i++) {
        if (day === calendarCells[i].innerHTML) {
            calendarCells[i].classList.remove("day__element--active");
        }
    }
}
