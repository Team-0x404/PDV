let funcs = {

    sendAjaxRequest: (url, postRequest = '', callbackFunction, headers) => {

        callbackFunction = callbackFunction || showRequestResult;

        // Объект XMLHttpRequest
        let xhr = new XMLHttpRequest();

        // Подготавливаем запроса
        xhr.open('POST', url, true);

        // Ставим заголовок что данные пришли с POST формы
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        // Ставим заголовок что это ajax (Например для Laravel)
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        // Accept Json
        xhr.setRequestHeader('Accept', 'application/json');

        // Поддержка laravel
        let CSRFToken = funcs.getLaravelCSRFToken();

        if (CSRFToken) {
            xhr.setRequestHeader(CSRFToken.header, CSRFToken.token);
        }

        // Устанавливаем дополнительные заголовки
        if (headers) {

            for (let header in headers) {

                if (!headers.hasOwnProperty(header)) continue;

                let headerValue = headers[header];

                xhr.setRequestHeader(header, headerValue);
            }
        }

        // Отправляем запрос
        xhr.send(postRequest);

        xhr.onreadystatechange = function () {

            // если запрос не завершён выходим
            if (xhr.readyState !== 4) return;

            // если запрос завершён с ошибкой
            if (xhr.status !== 200) {
                console.log(xhr.status + ': ' + xhr.statusText);
                return;
            }

            // Получаем ответ
            let response = xhr.responseText;

            try {
                response = JSON.parse(response)

            } finally {

                if (funcs.isFunc(callbackFunction)) {
                    callbackFunction(response);
                }
            }
        };

        function showRequestResult(result) {

            let errors = result.errors || [];

            if (result.error) {
                errors.push({'error': result.error})
            }

            errors.forEach(function (error) {

                for (let errorName in error) {

                    if (!error.hasOwnProperty(errorName)) continue;

                    let errorText = error[errorName];

                    console.log(errorName + ': ' + errorText);
                }
            });
        }
    },

    changeSelectedElement: function (selectiveElement, className, insideElement, previousElement) {

        insideElement = insideElement || document;

        // Мы либо передаём элемент у котрого нужно сменить класс либо находим по классу
        let previousSelectedElement = previousElement || insideElement.querySelector('.' + className);

        if (previousSelectedElement) {
            previousSelectedElement.classList.remove(className)
        }

        selectiveElement.classList.add(className);
    },

    isTouchDevice: function () {
        return 'ontouchstart' in window        // works on most browsers
            || navigator.maxTouchPoints;       // works on IE10/11 and Surface
    },

    forEach: function (collection, func) {
        return Array.prototype.forEach.call(collection, func);
    },

    find: function (collection, func) {
        return Array.prototype.find.call(collection, func);
    },

    copyTextToClipboard: function (text) {

        let textArea = document.createElement('textarea');

        // *** This styling is an extra step which is likely not required. ***
        //
        // Why is it here? To ensure:
        // 1. the element is able to have focus and selection.
        // 2. if element was to flash render it has minimal visual impact.
        // 3. less flakyness with selection and copying which **might** occur if
        //    the textarea element is not visible.
        //
        // The likelihood is the element won't even render, not even a flash,
        // so some of these are just precautions. However in IE the element
        // is visible whilst the popup box asking the user for permission for
        // the web page to copy to the clipboard.

        // Place in top-left corner of screen regardless of scroll position.
        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;

        // Ensure it has a small width and height. Setting to 1px / 1em
        // doesn't work as this gives a negative w/h on some browsers.
        textArea.style.width = '2em';
        textArea.style.height = '2em';

        // We don't need padding, reducing the size if it does flash render.
        textArea.style.padding = 0;

        // Clean up any borders.
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';

        // Avoid flash of white box if rendered for any reason.
        textArea.style.background = 'transparent';
        textArea.value = text;

        document.body.appendChild(textArea);

        textArea.select();

        try {
            let successful = document.execCommand('copy');
            let msg = successful ? 'successful' : 'unsuccessful';

            console.log('Copying text command was ' + msg);
        } catch (err) {

            console.log('Oops, unable to copy');
        }

        document.body.removeChild(textArea);
    },

    isCopyTextToClipboardSupported: function () {

        let result;

        try {
            result = document.queryCommandSupported('copy')

        } catch (e) {
            result = false;
        }

        return result;
    },

    getLaravelCSRFToken: function () {

        let CSRFToken = document.querySelector('meta[name="csrf-token"]').content;

        return CSRFToken ? {header: 'X-CSRF-TOKEN', token: CSRFToken} : null;
    },

    numberFormat: function (number, precision) {

        // Округялем число возвращает кол-во цифр после точки
        if (precision) {
            number = parseInt(number).toFixed(precision)
        }

        // Преобразуем к строке
        number = String(number);

        // Разбивает 3 числа пробелом
        return number.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')
    },

    normalizeNumber: function (price) {

        // Убираем пробелы
        price = price.replace(/ /g, '');

        // Преобразуем в integer
        return parseInt(price);
    },

    isString: function (mylet) {
        return (typeof mylet === 'string' || mylet instanceof String);
    },

    isFunc: function (mylet) {
        return typeof mylet === 'function';
    },

    isObject: function (mylet) {
        return typeof mylet === 'object' && mylet !== null;
    },

    isNotEmpty: function (array) {
        return array != null && array.length != null && array.length > 0;
    },

    isEmpty: function (array) {
        return !funcs.isNotEmpty(array);
    },

    getValueProperty: function (inputElement) {

        let inputElements = ['INPUT'];

        let tagName = inputElement.tagName;

        if (~inputElements.indexOf(tagName)) {
            return 'value';
        }

        return 'innerHTML';
    },

    setValue: function (element, value) {

        let valueProperty = funcs.getValueProperty(element);

        element[valueProperty] = value;
    },

    getValue: function (element) {

        let valueProperty = funcs.getValueProperty(element);

        return element[valueProperty];
    },

    gtagExistsCheck: function () {
        return (typeof (gtag) !== 'undefined' || typeof gtag === 'function');
    },

    translit: function (text) {

        // Удаляем пробелы
        text = text.trim();

        // Перевод в нижний регистр
        text = text.toLowerCase();

        // Символ, на который будут заменяться все спецсимволы
        let special = '';
        let space = '-';

        // Массив для транслитерации
        let transl = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
            'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
            'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h',
            'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': special, 'ы': 'y', 'ь': special,
            'э': 'e', 'ю': 'yu', 'я': 'ya',
            ' ': space, '_': space, '`': special, '~': special, '!': special, '@': special,
            '#': special, '$': special, '%': special, '^': special, '&': special, '*': special,
            '(': special, ')': special, '-': space, '\=': special, '+': special, '[': special,
            ']': special, '\\': special, '|': special, '/': special, '.': special, ',': special,
            '{': special, '}': special, '\'': special, '"': special, ';': special, ':': special,
            '?': special, '<': special, '>': special, '№': special
        };

        let regex = new RegExp('[^0-9A-Za-z' + space + ']', 'gi');

        let result = '';
        let current_char = '';

        for (i = 0; i < text.length; i++) {

            // Если символ найден в массиве то меняем его
            if (transl[text[i]] !== undefined) {

                if (current_char !== transl[text[i]] || current_char !== special) {
                    result += transl[text[i]];
                    current_char = transl[text[i]];
                }
            }

            // Если не найден
            else {
                current_char = text[i].replace(regex, '');

                result += current_char;
            }
        }

        // Удаляет больше чем 2 пробельных символа
        result = result.replace(new RegExp(space + '+(?=' + space + ')', 'g'), '');

        return trimStr(result);

        function trimStr(s) {
            s = s.replace(/^-/, '');

            return s.replace(/-$/, '');
        }
    },

    clearForm: function (insideElement) {

        // Используем либо ID формы либо переданный элемент
        if (funcs.isString(insideElement)) {
            insideElement = document.querySelector(insideElement);
        }

        let inputsElements = funcs.getFormElements(insideElement);

        funcs.forEach(inputsElements, function (inputElement) {
            inputElement.innerHTML = '';
            inputElement.value = '';
        });
    },

    getFormElements: function (insideElement) {
        return insideElement.querySelectorAll('INPUT, TEXTAREA, SELECT');
    },

    getParam: function (cssTag, param, insideElement) {

        insideElement = insideElement || document;

        param = param || 'innerText';

        let element = insideElement.querySelector(cssTag);

        if (!element) {
            return null
        }

        return element[param];
    },

    setParam: function (cssTag, param, value, insideElement) {

        insideElement = insideElement || document;

        let element = insideElement.querySelector(cssTag);

        if (element) {
            element[param] = value;
        }

        return element;
    },

    formSubmit: function (formElement, callbackFunc, beforeSubmitCallbackFunc, doFormCheck = true, visibleFormElements = true) {

        if (funcs.isString(formElement)) {
            formElement = document.getElementById(formElement);
        }

        formElement.addEventListener('submit', doSubmitAttempt, false);

        function doSubmitAttempt(event) {

            event.preventDefault();

            // Проверка формы
            if (doFormCheck && !checkForm(formElement)) {
                return false;
            }

            let url = formElement.action;

            let postRequest = urls.getFormData(formElement, {onlyVisible: visibleFormElements});

            if (funcs.isFunc(beforeSubmitCallbackFunc)) {
                beforeSubmitCallbackFunc.call(formElement);
            }

            funcs.sendAjaxRequest(url, postRequest, callbackFunc);
        }
    },

    dispatchEvent: function (element, event, value) {

        let myEvent = new CustomEvent(event, {
            bubbles: true,

            // detail - стандартное свойство CustomEvent для произвольных данных
            detail: value
        });

        element.dispatchEvent(myEvent);
    },

    getInputValue: function (radioElementsName, insideElement) {

        if (!insideElement) {
            insideElement = document;

        } else if (funcs.isString(insideElement)) {
            insideElement = document.querySelector(insideElement)
        }

        let inputRadioElement = insideElement.querySelector('[name=' + radioElementsName + ']:checked');

        return inputRadioElement ? inputRadioElement.value : null;
    },

    getInputRadioValue: function (radioElementsName, insideElement) {

        insideElement = insideElement || document;

        let inputRadioElements = insideElement.querySelectorAll('[name=' + radioElementsName + ']');

        for (let i = 0, length = inputRadioElements.length; i < length; i++) {

            if (inputRadioElements[i].checked) {
                return inputRadioElements[i].value;
            }
        }
    },
};

let urls = {

    serializeObject: function (object, exceptData) {

        let postArray = [];

        let exceptArray = [];

        if (exceptData) {

            if (funcs.isString(exceptData)) {
                exceptArray.push(exceptData);
            }

            if (Array.isArray(exceptData)) {
                exceptArray = exceptData;
            }
        }

        for (let objectProperty in object) {

            if (!object.hasOwnProperty(objectProperty)) {
                continue;
            }

            if (~exceptArray.indexOf(objectProperty)) {
                continue;
            }

            let objectValue = object[objectProperty];

            postArray.push(encodeURIComponent(objectProperty) + '=' + encodeURIComponent(objectValue));
        }

        return postArray.join('&');
    },

    addToPostString(postString, name, value) {
        return postString + '&' + name + '=' + encodeURIComponent(value);
    },

    getURLSeparator: function (url) {
        return ~url.indexOf('?') ? '&' : '?'
    },

    changeGetParam: function (url, param, paramValue, options) {

        options = options || {};

        let dontAddIfExists = options.dontAddIfExists;
        let removeEmptyFlag = options.removeEmpty;

        let urlParts = url.split('#');

        let newUrl = urlParts[0];
        let urlHash = urlParts[1];

        let removeEmpty = removeEmptyFlag && !paramValue;

        // Если url содержит параметр
        if (~url.indexOf(param + '=')) {

            // paramRegexString = '(.*' + param + '=)([^&]+)(.*)';
            let paramRegexString = '(.*)(' + param + '=)([^&]+)(&?)(.*)';

            let paramRegex = new RegExp(paramRegexString);

            // Если нужно удалить пустой параметр (и удаляем &)
            if (removeEmpty) {

                newUrl = newUrl.replace(paramRegex, '$1$5');

                // Удаляем знак ? или & в конце (через одно выражение не получилось)
                newUrl = newUrl.replace(/[?|&]$/, '');

            } else {
                newUrl = newUrl.replace(paramRegex, '$1$2' + paramValue + '$4$5');
            }

        } else if (!dontAddIfExists && !removeEmpty) {

            let urlSeparator = urls.getURLSeparator(url);

            newUrl = newUrl + urlSeparator + param + '=' + encodeURIComponent(paramValue);
        }

        if (urlHash) {
            newUrl = newUrl + '#' + urlHash;
        }

        return newUrl;
    },

    getFormData: function (formElement, options) {

        options = options || {};

        let onlyVisible = options.onlyVisible;
        let skipEmpty = options.skipEmpty;
        let returnArray = options.returnArray;

        let returnObject = options.returnObject;
        let onlyNames = options.onlyNames;
        let ampersand = options.ampersand;

        let formMainElement;

        let postStringArray = [];

        // Используем либо ID формы либо переданный элемент
        if (funcs.isString(formElement)) {
            formMainElement = document.querySelector(formElement);
        } else {
            formMainElement = formElement;
        }

        let formElements = funcs.getFormElements(formMainElement);

        funcs.forEach(formElements, function (formElement) {

            // Пропускаем неактивные
            if (formElement.disabled) {
                return;
            }

            // Пропускаем невидимые элементы
            if (onlyVisible && !formElement.clientWidth && formElement.type !== 'hidden') {
                return;
            }

            // Пропускаем ненужные элементы формы
            if (onlyNames && !~onlyNames.indexOf(formElement.name)) {
                return;
            }

            // Input type=[radio] или нет
            let inputRadioOrCheckbox = formElement.tagName === 'INPUT' && (formElement.type === 'radio' || formElement.type === 'checkbox');

            // Пропускаем не отмеченные input radio
            if (inputRadioOrCheckbox && !formElement.checked) {
                return;
            }

            // Пропускаем пустые элементы формы
            if (skipEmpty && !formElement.value) {
                return;
            }

            // Добавляем в массив
            if (returnArray || returnObject) {
                postStringArray.push([formElement.name, formElement.value]);
            } else {
                postStringArray.push(formElement.name + '=' + encodeURIComponent(formElement.value));
            }
        });

        // Возвращаем в качестве массива
        if (returnArray) {
            return postStringArray;
        }

        if (returnObject) {

            let postObject = {};

            postStringArray.forEach(function (item) {
                postObject[item[0]] = item[1];
            });

            return postObject;
        }

        // Переводдим в строку
        let postString = postStringArray.join('&');

        // Добавляем амперсанд впереди
        if (postString && ampersand) {
            postString = ampersand + postString;
        }

        return postString;
    },

    getCurrentCleanURL: function () {

        // Текущий URL без параметров
        return location.protocol + '//' + location.host + location.pathname;
    },

    removeHash: function () {
        history.pushState('', document.title, window.location.pathname + window.location.search)
    },

    makeRedirect: function (url, params) {

        // Не перезагружает если одна и та же ссылка и есть анкор
        if (url === window.location.href && !params) {
            window.location.reload();

        } else {

            let redirectUrl = url;

            if (params) {
                redirectUrl += '?' + params;
            }

            window.location.href = redirectUrl;
        }
    },

    reloadPage: function (postString) {

        let url = urls.getCurrentCleanURL();

        if (postString) {
            url = url + '?' + postString;
        }

        urls.makeRedirect(url);
    }
};

let dom = {

    createElement: function (elementName, options) {

        /* USING:

               tooltipElement = dom.createElement('elementName', {
                   elementText: 'PLEASE SELECT TIME',
                   className: ['tooltip2', 'tooltip-error'],
                   attributeName: 'id',
                   attributeValue: 'select-time-error'
               });

            */

        elementName = elementName || 'span';

        let attributeName = options.attributeName || false;
        let attributeValue = options.attributeValue || false;
        let elementText = options.elementText || '';
        let text = options.text || '';
        let className = options.className;
        let value = options.value;
        let name = options.name;
        let type = options.type;

        let element = document.createElement(elementName);

        if (attributeName) {

            let attribute = document.createAttribute(attributeName);

            if (attributeValue) {
                attribute.value = attributeValue;
            }

            element.setAttributeNode(attribute);
        }

        if (className) {

            if (Array.isArray(className)) {

                className.forEach(function (classNameValue) {
                    element.classList.add(classNameValue);
                });

            } else {
                element.classList.add(className)
            }
        }

        if (value) {
            element.value = value;
        }

        if (text) {
            element.text = text;
        }

        if (elementText) {
            element.innerHTML = elementText;
        }

        if (name) {
            let attribute = document.createAttribute('name');

            attribute.value = name;
            element.setAttributeNode(attribute);
        }

        if (type) {
            let attribute = document.createAttribute('type');

            attribute.value = type;
            element.setAttributeNode(attribute);
        }

        return element;
    },

    insertBefore: function (insertedElement, beforeElement) {
        return beforeElement.parentNode.insertBefore(insertedElement, beforeElement);
    },

    insertAfter: function (insertedElement, afterElement) {

        // Если передаём html
        if (typeof (insertedElement) === 'string') {
            afterElement.insertAdjacentHTML('afterEnd', insertedElement);

            return afterElement.nextSibling;
        }

        // Если передаём элемент
        else {
            return afterElement.parentNode.insertBefore(insertedElement, afterElement.nextSibling);
        }
    },

    getScrollWidth: function () {

        // Создадим элемент с прокруткой
        let div = document.createElement('div');

        div.style.overflowY = 'scroll';
        div.style.width = '50px';
        div.style.height = '50px';

        // При display:none размеры нельзя узнать
        div.style.visibility = 'hidden';

        document.body.appendChild(div);

        let scrollWidth = div.offsetWidth - div.clientWidth;

        document.body.removeChild(div);

        return scrollWidth;
    },

    increaseInputNameAttribute: function (inputElement, increaseNum) {

        increaseNum = increaseNum || 1;

        // Заменяем порядковый номер имени формы
        let inputName = inputElement.name;

        if (!inputName) {
            return;
        }

        let numRegex = /\[(\d+)]/;

        let numFound = inputName.match(numRegex);

        if (numFound) {
            let nextNum = +numFound[1] + increaseNum;

            inputElement.name = inputName.replace(numFound[0], '[' + nextNum + ']');
        }
    },

    clone: function (element, options) {

        let formNameArrayCount = options.formNameArrayCount;
        let exceptHidden = options.exceptHidden;
        let clonedElement = element.cloneNode(true);

        let formElements = funcs.getFormElements(clonedElement)

        let tooltipElements = clonedElement.querySelectorAll('[data-tooltip]');
        let borderErrorElements = clonedElement.querySelectorAll('.input-error');

        if (clonedElement.classList.contains('input-error')) {
            clonedElement.classList.remove('input-error')
        }

        funcs.forEach(formElements, function (inputElement) {

            if (formNameArrayCount) {

                let inputName = inputElement.name;
                let numRegex = /\[(\d+)]/;
                let numFound = inputName.match(numRegex);

                if (numFound) {
                    let nextNum = +numFound[1] + formNameArrayCount;

                    inputElement.name = inputName.replace(numFound[0], '[' + nextNum + ']');
                }
            }

            if (exceptHidden && inputElement.tagName === 'INPUT' && inputElement.type === 'hidden') {
                return;
            }

            if (inputElement.tagName === 'SELECT') {
                return;
            }

            if (inputElement.tagName === 'TEXTAREA') {
                inputElement.innerHTML = '';
            }

            inputElement.value = '';
        });

        funcs.forEach(tooltipElements, function (tooltipElement) {
            tooltipElement.remove();
        });

        funcs.forEach(borderErrorElements, function (errorElement) {
            errorElement.classList.remove('input-error')
        });

        return clonedElement;
    }
};

function ToggleClass(options) {

    let clickableElementsCSS = options.clickableElementsCSS;
    let modifiableElementsCSS = options.modifiableElementsCSS;

    // Может быть и строкой и массивом
    let addingClassName = options.addingClassName;

    let callbackFunction = options.callbackFunction || null;

    // Когда на 1 кликабельный элеммент приходится 1 порядковый по счёту модифицируемый
    let useParallelModify = options.useParallelModify || false;

    // Текст кнопки при клике
    let changeClickableText = options.changeClickableText || false;

    // Анимируем открытие элемента (порядок следование modifiableElementsCSS: кликабельный, открываемый)
    let animateOpen = options.animateOpen || false;

    // Когда элемент Fixed нужно изменить absolute чтобы работала прокрутка
    let makeScrollableElementID = options.makeScrollableElementID || false;
    //  makeScrollableElementID: 'header',

    // Hash url страницы
    let setUrlHash = options.setUrlHash || false;

    // Старый текст кнопки
    let oldClickableText;

    // Элемент на который кликается
    let clickableElements = document.querySelectorAll(clickableElementsCSS);

    let modifiableElements;

    // Если элемент по которому кликают равен элементу у которого меняют класс
    if (!modifiableElementsCSS) {
        modifiableElements = clickableElements
    } else {
        modifiableElements = document.querySelectorAll(modifiableElementsCSS);
    }

    // Выходим если нет нужных элемнетов
    if (!clickableElements || !modifiableElements) return;

    let startUpUrlHash = location.hash;

    // Если нужно анимировать открытие
    if (animateOpen) {

        new AnimateOpen({
            clickableElementsCSS: modifiableElementsCSS[0],
            openElementsCSS: modifiableElementsCSS[1],
            openedClass: addingClassName[1],
            singleElement: true
        });
    }

    // Если на странице уже остановлен hash установленных классов
    if (setUrlHash && (location.hash === '#' + setUrlHash)) {

        // Эмулируем клик на любой кликабельый элемент
        changeClasses(clickableElements[0], 0, false);
    }

    funcs.forEach(clickableElements, function (clickableElement, index) {

        // Ставим обработчик на элеммент который меняет класс
        clickableElement.addEventListener('click', function (event) {

            event.preventDefault();

            changeClasses(clickableElement, index, true);

        }, false);
    });

    function changeClasses(clickableElement, index, processHash) {

        if (useParallelModify) {

            // Порядковый номер кликабельного элемента соответстует порядковму номеру модифицируемого
            let modifiableElement = modifiableElements[index];

            // Если нет соответсвюущего порядковому номеру изменяемого элемента то используем первый
            if (!modifiableElement) {
                modifiableElement = modifiableElements[0];
            }

            modifiableElement.classList.toggle(addingClassName);

        } else {

            funcs.forEach(modifiableElements, function (modifiableElement, index) {

                let className = (function () {

                    // Если одинаковый class для всех элементов
                    if (funcs.isString(addingClassName)) {
                        return addingClassName;
                    }

                    return addingClassName[index]
                })();

                // При анимации открытия класс у открываюшего элемента ставит AnimateOpen
                if (!(animateOpen && index === 1)) {
                    modifiableElement.classList.toggle(className);
                }
            });
        }

        if (changeClickableText) {

            // Пока есть вложенные элементы
            while (clickableElement.nodeType === 1 && clickableElement.firstElementChild) {
                clickableElement = clickableElement.firstElementChild;
            }

            if (!oldClickableText) {
                oldClickableText = clickableElement.textContent;

                clickableElement.textContent = changeClickableText;
            } else {
                clickableElement.textContent = oldClickableText;

                oldClickableText = false;
            }
        }

        if (funcs.isFunc(callbackFunction)) {
            callbackFunction.call(clickableElement);
        }

        if (processHash) {
            processUrlHash();
        }
    }

    function processUrlHash() {

        if (!setUrlHash) return;

        if (location.hash && (location.hash === startUpUrlHash)) {
            urls.removeHash()
        } else {
            location.hash = setUrlHash;
        }
    }
}

function Tabs(options = {}) {

    let tabMenuWrapperID = options.tabMenuWrapperID || 'tabs-menu';
    let tabMenuAttribute = options.tabMenuAttribute || 'data-tabs-menu';
    let tabMenuItemAttribute = options.tabMenuItemAttribute || 'data-tab-open';

    let tabItemsWrapperID = options.tabItemsWrapperID || 'tabs';
    let tabItemsWrapperAttribute = options.tabItemsWrapperAttribute || 'data-tabs';
    let tabItemAttribute = options.tabItemAttribute || 'data-tab';

    let tabMenuActiveClass = options.tabMenuActiveClass || 'active';
    let tabActiveClass = options.tabActiveClass || 'active';

    let setTabMenuActiveClassToParent = options.setTabMenuActiveClassToParent || false;

    // Если нужно отключать активные табы при нажатии
    let disableActiveTab = options.disableActiveTab || false;

    // Если Multi Tabs
    let tabsBlockAttribute = options.tabsBlockAttribute;
    let tabBlocksElements = options.tabBlocksElements

    let singleTabs = !tabsBlockAttribute && !tabBlocksElements;

    let tabsMenuWrappers = [];

    // Single Tabs
    if (singleTabs) {

        let tabsMenuWrapper = document.getElementById(tabMenuWrapperID);
        let tabsItemsWrapper = document.getElementById(tabItemsWrapperID);

        tabsMenuWrapper.tabsItemsWrapper = tabsItemsWrapper;

        tabsMenuWrappers[0] = tabsMenuWrapper;
    }

    // Multi Tabs
    else {

        tabBlocksElements = tabBlocksElements || document.querySelectorAll('[' + tabsBlockAttribute + ']');

        funcs.forEach(tabBlocksElements, function (tabBlock, index) {

            let tabsMenuWrapper = tabBlock.querySelector('[' + tabMenuAttribute + ']');
            let tabsItemsWrapper = tabBlock.querySelector('[' + tabItemsWrapperAttribute + ']');

            tabsMenuWrapper.tabsItemsWrapper = tabsItemsWrapper;

            tabsMenuWrappers[index] = tabsMenuWrapper;
        });
    }

    funcs.forEach(tabsMenuWrappers, function (tabsMenuWrapper) {

        tabsMenuWrapper.addEventListener('click', function (event) {

            event.preventDefault();

            let tabMenuItem = event.target.closest('[' + tabMenuItemAttribute + ']');

            if (!tabMenuItem) return;

            changeActiveTab(tabsMenuWrapper, tabMenuItem);

        }, false);

    });

    if (singleTabs) {
        changeStartUpActiveTab();
    }

    // Меняем tab при перезагрузке страницы
    function changeStartUpActiveTab() {

        // Получаем якорь страницы
        let currentTabHash = location.hash;

        currentTabHash = currentTabHash.replace('#', '');

        if (!currentTabHash) return;

        let tabsMenuWrapper = tabsMenuWrappers[0];

        // Находим нужный меню элемент по его хешу
        let tabMenuItem = tabsMenuWrapper.querySelector('[' + tabMenuItemAttribute + '="' + currentTabHash + '"]');

        if (!tabMenuItem) return;

        changeActiveTab(tabsMenuWrapper, tabMenuItem);
    }

    function changeActiveTab(tabsMenuWrapper, clickedMenuItem) {

        let tabMenuElements = tabsMenuWrapper.querySelectorAll('[' + tabMenuItemAttribute + ']');

        tabMenuElements = Array.prototype.slice.call(tabMenuElements);

        let tabsItemsWrapper = tabsMenuWrapper.tabsItemsWrapper;

        let tabItems = tabsItemsWrapper.children;

        let tabNumber = tabMenuElements.indexOf(clickedMenuItem);

        let selectedTabElement = tabItems[tabNumber];

        // Актив класс может быть у родительского элемента
        let clickedMenuElement = clickedMenuItem;

        if (setTabMenuActiveClassToParent) {
            clickedMenuElement = clickedMenuItem.parentElement;
        }

        let selectedTabHash;

        // Если сам таб не активный
        if (!selectedTabElement.classList.contains(tabActiveClass)) {

            // Прошлый выбранный таб
            let previousSelectedTab = funcs.find(tabItems, function (tabItem) {
                return tabItem.classList.contains(tabActiveClass)
            });

            // Включаем сам tab
            funcs.changeSelectedElement(selectedTabElement, tabActiveClass, tabsItemsWrapper, previousSelectedTab);

            // Включаем пукнт меню
            funcs.changeSelectedElement(clickedMenuElement, tabMenuActiveClass, tabsMenuWrapper);

            if (singleTabs) {

                selectedTabHash = selectedTabElement.getAttribute(tabItemAttribute);

                // Меняем якорь страницы
                location.hash = selectedTabHash;
            }

            funcs.dispatchEvent(tabsMenuWrapper, 'tab-' + selectedTabHash, {
                value: selectedTabHash
            });

        } else if (disableActiveTab) {

            // Если нужно выключить таб
            selectedTabElement.classList.remove(tabActiveClass);
            clickedMenuElement.classList.remove(tabMenuActiveClass);
        }
    }
}