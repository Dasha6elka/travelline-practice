const Control = {
    IN: 0,
    OUT: 1
};

const state = {
    today: new Date(),

    control: null,

    year: null,

    months: {
        _left: null,

        get left() {
            return this._left;
        },

        set left(left) {
            $("#left__month__name").html(`${getTranslationOfMonth(left)} ${state.year}`);
            this._left = left;
        },

        _right: null,

        set right(right) {
            $("#right__month__name").html(`${getTranslationOfMonth(right)} ${state.year}`);
            this._right = right;
        },

        get right() {
            return this._right;
        }
    },

    _arrival: null,

    set arrival(date) {
        $(".day__element").removeClass("day__element--active");
        if (!date) {
            return;
        }
        // если дата заезда больше или равна дате выезда
        // то увеличим дату выезда на дату заезда + 1
        if (this.departure && checkLeftDateMore(date, this.departure)) {
            this.departure = getNextDayFromCurrent(date);
        }
        const monthOffset = getMonthOffset(date);
        $(`.day__element:not(:empty):eq(${date.getDate() - 1 + monthOffset})`).addClass("day__element--active");
        $("#control__in > input").attr("value", getFriendlyDate(date));
        this._arrival = date;
    },

    get arrival() {
        return this._arrival;
    },

    _departure: null,

    get departure() {
        return this._departure;
    },

    set departure(date) {
        $(`.day__element`).removeClass("day__element--active");
        if (!date) {
            return;
        }
        const arrivalMonthOffset = getMonthOffset(this.arrival);
        const departureMonthOffset = getMonthOffset(date);
        // т.к. сеттер departure может вызваться в сеттере arrival
        // мы не производим никакого изменения в UI если вызвались из arrival
        if (this.control === Control.OUT && date.getMonth() <= state.months.right && date.getFullYear() <= state.year) {
            $(`.day__element:not(:empty):eq(${date.getDate() - 1 + departureMonthOffset})`).addClass("day__element--active");
        }
        const activeCellsBounds = {
            get left() {
                if (state.arrival.getMonth() < state.months.left || state.arrival.getFullYear() <= state.year) {
                    return 0;
                }
                return state.arrival.getDate() - 1 + arrivalMonthOffset;
            },

            get right() {
                if (date.getMonth() > state.months.right || date.getFullYear() > state.year) {
                    return Infinity;
                }
                return date.getDate() - 1 + departureMonthOffset - this.left;
            }
        };
        // т.к. сеттер departure может вызваться в сеттере arrival
        // мы не производим никакого изменения в UI если вызвались из arrival
        if (this.control === Control.OUT) {
            $(`.day__element:not(:empty):gt(${activeCellsBounds.left}):lt(${activeCellsBounds.right})`).addClass("day__element--active");
            $(`.day__element:not(:empty):eq(${activeCellsBounds.left})`).addClass("day__element--active");
        }
        $("#control__out > input").attr("value", getFriendlyDate(date));
        this._departure = date;
    }
};

$(document).ready(() => {
    // установка начального значения года
    state.year = state.today.getFullYear();
    // начальная установка текущего месяца левого календаря
    state.months.left = state.today.getMonth();
    // начальная установка текущего месяца правого календаря
    state.months.right = state.today.getMonth() + 1;

    // установка начального значения даты заезда
    $("#control__in > input").attr("value", getFriendlyDate(state.today));
    // установка начального значения даты выезда
    $("#control__out > input").attr("value", getFriendlyDate(getNextDayFromCurrent(state.today)));

    // показ левого календаря по клику на поле календаря
    $("#control__in").on("click", () => {
        state.control = Control.IN;
        $("#calendar").toggleClass("calendar--hidden");
        state.arrival = state.arrival;
        $(".day__element:not(empty)").removeClass("day__element--disabled");
        $(".day__element:not(empty)").removeClass("day__element--first-selected");
    });

    // показ правого календаря по клику на поле календаря
    $("#control__out").on("click", () => {
        state.control = Control.OUT;
        $("#calendar").toggleClass("calendar--hidden");
        state.departure = state.departure;
        if (state.arrival) {
            disableDatesBeforeArrival();
        }
    });

    // начальное выключение кнопки назад календаря
    $("#prev__arrow").addClass("month__element__arrow--disabled");
    // обработка стрелки календаря назад
    $("#prev__arrow").on("click", () => {
        state.months.right = getPrevMonth(state.months.right);
        if (state.months.left === 0) {
            state.year--;
        }
        state.months.left = getPrevMonth(state.months.left);

        // если месяц меньше текущего, выключаем кнопку назад
        if (checkYearAndMonthEqual(state.today, new Date(state.year, state.months.left))) {
            $("#prev__arrow").addClass("month__element__arrow--disabled");
        }

        // отчистка таблицы
        $(".day__element")
            .html("")
            .removeClass()
            .addClass("day__element");

        // заполнение левой стороны календаря
        fillCalendarTableCells("#left__month__element", state.months.left, onCellClick);

        // заполнение правой стороны календаря
        fillCalendarTableCells("#right__month__element", state.months.right, onCellClick);

        if (
            ((state.months.left >= state.arrival.getMonth() && state.months.right <= state.departure.getMonth()) ||
                (state.months.left == state.departure.getMonth() && state.months.right > state.departure.getMonth())) &&
            state.year >= state.arrival.getFullYear() &&
            state.year <= state.departure.getFullYear()
        ) {
            state.arrival = state.arrival;
            state.departure = state.departure;
            disableDatesBeforeArrival();
        }

        if (state.today.getMonth() === state.months.left && state.today.getFullYear() === state.year) {
            $(`.day__element:not(:empty):lt(${state.today.getDate() - 1})`).addClass("day__element--disabled-permanently");
        }
        setActiveArrivalDate(state.months.left);
        setActiveArrivalDate(state.months.right);
        // if (state.arrival.getMonth() === state.months.right && state.today.getFullYear() === state.year) {
        //     state.arrival = state.arrival;
        // }
        // if (state.arrival.getMonth() === state.months.left && state.today.getFullYear() === state.year) {
        //     state.arrival = state.arrival;
        // }
    });

    // обработка стрелки календаря вперёд
    $("#next__arrow").on("click", () => {
        // включение кнпоки назад календаря
        $("#prev__arrow").removeClass("month__element__arrow--disabled");

        state.months.left = getNextMonth(state.months.left);
        if (state.months.right === 11) {
            state.year++;
        }
        state.months.right = getNextMonth(state.months.right);

        // отчистка таблицы
        $(".day__element")
            .html("")
            .removeClass()
            .addClass("day__element");

        // заполнение левой стороны календаря
        fillCalendarTableCells("#left__month__element", state.months.left, onCellClick);

        // заполнение правой стороны календаря
        fillCalendarTableCells("#right__month__element", state.months.right, onCellClick);

        if (
            ((state.months.left >= state.arrival.getMonth() && state.months.right <= state.departure.getMonth()) ||
                (state.months.left == state.departure.getMonth() && state.months.right > state.departure.getMonth())) &&
            state.year >= state.arrival.getFullYear() &&
            state.year <= state.departure.getFullYear()
        ) {
            state.arrival = state.arrival;
            state.departure = state.departure;
            disableDatesBeforeArrival();
        }
        setActiveArrivalDate(state.months.left);
        setActiveArrivalDate(state.months.right);
        // if (state.arrival.getMonth() === state.months.left && state.today.getFullYear() === state.year) {
        //     state.arrival = state.arrival;
        // }
        // if (state.arrival.getMonth() === state.months.right && state.today.getFullYear() === state.year) {
        //     state.arrival = state.arrival;
        // }
    });

    // заполнение левой стороны календаря
    fillCalendarTableCells("#left__month__element", state.today.getMonth(), onCellClick);

    // заполнение правой стороны календаря
    fillCalendarTableCells("#right__month__element", getNextMonth(state.today.getMonth()), onCellClick);

    // вылючаем даты до текущей
    $(`.day__element:not(:empty):lt(${state.today.getDate() - 1})`).addClass("day__element--disabled-permanently");

    // выделяем текущую дату как дату заезда
    state.arrival = state.today;
    // выделяем следующую дату как дату выезда
    state.departure = getNextDayFromCurrent(state.today);
});

function onCellClick(date) {
    $("#calendar").toggleClass("calendar--hidden");
    // если клик на заезд, то ставим arrival
    if (state.control === Control.IN) {
        state.arrival = date;
    }
    // если клик на выезд, то ставим departure
    if (state.control === Control.OUT) {
        state.departure = date;
    }
}

function fillCalendarTableCells(calendarId, month, handleCellClick) {
    const daysInCurrentMonth = getDaysCount(state.today.getFullYear(), month);
    let fullYear = state.today.getFullYear();
    if (month === 0) {
        fullYear++;
    }
    if (month === 11) {
        fullYear--;
    }
    let firstDayPosition = new Date(fullYear, month, 1).getDay() - 1;
    if (firstDayPosition == -1) {
        firstDayPosition = 6;
    }
    const cells = $(`${calendarId} .day__element`);
    let calendarCellValue = 1;
    for (const i of Array(daysInCurrentMonth + firstDayPosition).keys()) {
        $(cells[i]).off("click");
        if (i < firstDayPosition) {
            continue;
        }
        $(cells[i]).html(calendarCellValue++);
        $(cells[i]).off("click");
        $(cells[i]).on("click", event => {
            event.preventDefault();
            const date = new Date(state.today.getFullYear(), month, $(cells[i]).html());
            handleCellClick(date);
        });
    }
}

function getFriendlyDate(date) {
    const day = normilizeDateNumber(date.getDate());
    const month = normilizeDateNumber(date.getMonth() + 1);
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function normilizeDateNumber(number) {
    if (number.toString().length === 1) {
        return `0${number}`;
    }
    return number.toString();
}

function getNextDayFromCurrent(date) {
    const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    return nextDate;
}

function getDaysCount(year, month) {
    const numberOfDaysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if ((year % 4 === 0 && year % 100 != 0) || year % 400 === 0) {
        numberOfDaysInMonths[1] = 29;
    }
    return numberOfDaysInMonths[month];
}

function getTranslationOfMonth(month) {
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
    return namesOfMonths[month];
}

function getNextMonth(month) {
    if (month === 11) {
        return 0;
    }
    return month + 1;
}

function getPrevMonth(month) {
    if (month === 0) {
        return 11;
    }
    return month - 1;
}

function getMonthOffset(date) {
    const monthOffset = date.getMonth() === state.months.left ? 0 : getDaysCount(date.getFullYear(), date.getMonth());
    return monthOffset;
}

function checkLeftDateMore(leftDate, rightDate) {
    return leftDate.getTime() >= new Date(rightDate.getFullYear(), rightDate.getMonth(), rightDate.getDate()).getTime();
}

function checkYearAndMonthEqual(leftDate, rightDate) {
    return leftDate.getFullYear() === rightDate.getFullYear() && leftDate.getMonth() === rightDate.getMonth();
}

function disableDatesBeforeArrival() {
    if (state.arrival.getMonth() < state.months.left || state.arrival.getFullYear() < state.year) {
        return;
    }
    const monthOffset = getMonthOffset(state.arrival);
    const monthOffsetD = getMonthOffset(state.departure);
    if (state.control == Control.OUT) {
        $(`.day__element:not(:empty):lt(${state.today.getDate()})`).addClass("day__element--disabled-permanently");
        $(`.day__element:not(:empty):lt(${state.departure.getDate() + monthOffsetD})`).addClass("day__element--active");
        $(`.day__element:not(:empty):lt(${state.arrival.getDate() + monthOffset})`)
            .addClass("day__element--disabled")
            .removeClass("day__element--active");
        $(`.day__element:not(:empty):eq(${state.arrival.getDate() - 1 + monthOffset})`).addClass("day__element--first-selected");
    }
}

function setActiveArrivalDate(month) {
    if (state.arrival.getMonth() === month && state.arrival.getFullYear() === state.year) {
        state.arrival = state.arrival;
    }
}
