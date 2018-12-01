(function (window, document) {
    "use strict";
    var fade = function (direction, section) {
            if (direction === 'out') {
                section.style.display = 'none';
                section.style.opacity = 0;
            } else {
                section.style.display = 'block';
                var sectionOpacity = parseFloat(section.style.opacity);
                if (isNaN(sectionOpacity)) {
                    sectionOpacity = 0;
                }

                if (sectionOpacity < 1) {
                    var newOpacity = sectionOpacity + parseFloat(0.05);
                    section.style.opacity = newOpacity.toFixed(2);
                    setTimeout(function() {
                        fade(direction, section);
                    }, 10);
                }
            }
        },

        sizeSectionContainer = function (container, section, endHeight) {
            var stepHeight = 20;
            var containerHeight = container.clientHeight;
            var newHeight = 0;
            if (containerHeight >= endHeight - stepHeight && containerHeight <= endHeight + stepHeight) {
                newHeight = endHeight;
            } else if (containerHeight > endHeight) {
                newHeight = containerHeight - stepHeight;
            } else if (containerHeight < endHeight) {
                newHeight = containerHeight + stepHeight;
            }

            container.style.height = newHeight + 'px';

            if (newHeight !== endHeight) {
                setTimeout(function() {
                    sizeSectionContainer(container, section, endHeight);
                }, 10);
            } else {
                fade('in', section);
            }
        },

        sizeSection = function (sectionID) {
            var section = document.getElementById(sectionID),
                sectionHeight = section.clientHeight;

            if (sectionHeight === 0) { // section is hidden, make it visible and hide again
                section.style.display = 'block';
                sectionHeight = section.clientHeight;
                section.style.display = 'none';
            }

            var contentElement = document.getElementsByClassName('content')[0],
                contentStyle = window.getComputedStyle(contentElement, null),
                contentMargins = parseInt(contentStyle.marginTop, 10) + parseInt(contentStyle.marginBottom, 10) + 20,
                viewportHeight = document.documentElement.clientHeight;

            if (sectionHeight > (viewportHeight - contentMargins)) {
                sectionHeight = viewportHeight - contentMargins;
            }

            var allSections = section.parentNode.children;
            for (var i=0; i < allSections.length; i++) {
                if (allSections[i].style.display !== 'none') {
                    fade('out', allSections[i]);
                }
            }
            sizeSectionContainer(section.parentNode, section, sectionHeight);
        },

        resizeSection = function () {
            var currentNavElement = document.getElementById('navigation').getElementsByClassName('current')[0].getElementsByTagName('a')[0],
                currentSectionId = currentNavElement.href.substring(currentNavElement.href.indexOf('#') + 1);

            sizeSection(currentSectionId);
        },

        observeEvent = function (element, eventName, eventFunction) {
            var setEvent = function(element, eventName, eventFunction) {
                if (element.addEventListener) {
                    element.addEventListener(eventName, eventFunction, false);
                } else if(element.attachEvent) {
                    element.attachEvent('on' + eventName, eventFunction);
                } else {
                    element['on' + eventName] = eventFunction;
                }
            };

            if (element instanceof Array) {
                for (var i=0; i < element.length; i++) {
                    setEvent(element[i], eventName, eventFunction);
                }
            } else {
                setEvent(element, eventName, eventFunction);
            }
        },

        setNavigationFromHash = function (hash) {
            var sectionId = 'hello';
            if (hash) {
                sectionId = hash.replace('#', '');
            }

            var navigation = document.getElementById('navigation'),
                navigationElements = navigation.children;
            for (var i=0; i < navigationElements.length; i++) {
                if (navigationElements[i].getElementsByTagName('a')[0].href.indexOf(sectionId) > -1) {
                    setNavigationElementCurrent(navigationElements[i]);
                    return sectionId;
                }
            }
        },

        setNavigationElementCurrent = function (navElement) {
            var currentElement = navElement.parentNode.getElementsByClassName('current')[0];

            currentElement.className = currentElement.className.replace(/current/, '');
            navElement.className = (navElement.className !== '' ? ' ' : '') + 'current';
        },


        monitorContactForm = function() {
            var contactForm = document.getElementById('contact').getElementsByTagName("FORM")[0],
                nameElement = document.getElementById('contactname'),
                emailElement = document.getElementById('contactemail'),
                phoneElement = document.getElementById('contactphone'),
                messageElement = document.getElementById('contactmessage'),
                mustenterElement = document.getElementById('mustenter'),

                changeClassName = function(element, action, className) {
                    switch(action) {
                        case 'add':
                            if (element.className.indexOf(className) === -1) {
                                element.className += ' ' + className;
                            }
                            break;
                        case 'remove':
                            element.className = element.className.replace(' ' + className, '');
                            break;
                    }
                },

                validateInputElement = function(element) {
                    var valid = false;
                    switch(element.name) {
                        case 'name':
                            if (element.value.length > 2) {
                                valid = true;
                            }
                            break;
                        case 'email':
                            if (element.value.length > 2 && element.value.indexOf('@') > 0) {
                                valid = true;
                            }
                            break;
                        case 'message':
                            if (element.value.length > 10) {
                                valid = true;
                            }
                            break;
                        default:
                            valid = true;
                    }

                    if (!valid) {
                        changeClassName(element, 'add', 'error');
                    } else {
                        changeClassName(element, 'remove', 'error');
                    }

                    return valid;
                },

                validateContactForm = function() {
                    var validname = validateInputElement(nameElement);
                    var validemail = validateInputElement(emailElement);
                    var validmessage = validateInputElement(messageElement);
                    return (validname && validemail && validmessage);
                };

            observeEvent([nameElement, emailElement, phoneElement, messageElement], 'blur', function() {
                if (this.value !== '') {
                    validateInputElement(this);
                } 
            });

            observeEvent(contactForm, 'submit', function(e) {
                e.preventDefault();

                var validForm = validateContactForm(this);
                if (validForm) {
                    // xhr stuff here

                    var form_vars = "mustenter=" + mustenterElement.value;
                        form_vars += "&name=" + nameElement.value;
                        form_vars += "&email=" + emailElement.value;
                        form_vars += "&phone=" + phoneElement.value;
                        form_vars += "&message=" + messageElement.value;

                    var xmlhttp;
                    if (window.XMLHttpRequest) {
                        xmlhttp = new XMLHttpRequest();
                    } else {
                        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                    }

                    xmlhttp.onreadystatechange = function() {
                        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                            var returndata = xmlhttp.responseText;
                            var returnJSON = JSON.parse(returndata);
                            if (returnJSON.send) {
                                document.getElementById('contact').getElementsByTagName('fieldset')[0].innerHTML = 'contact information is send';
                                sizeSection('contact');
                            } else {
                                console.log(returnJSON.errors);
                                if (returnJSON.errors.hasOwnProperty("name")) {
                                    changeClassName(nameElement, "add", "error");
                                }
                                if (returnJSON.errors.hasOwnProperty("email")) {
                                    changeClassName(emailElement, "add", "error");
                                }
                                if (returnJSON.errors.hasOwnProperty("message")) {
                                    changeClassName(messageElement, "add", "error");
                                }
                            }
                        }
                    };
                    
                    xmlhttp.open("POST","/email.php",true);
                    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                    xmlhttp.send(form_vars);
                }
            });
        },


        init = function () {
            observeEvent(window, 'hashchange', function() {
                if (typeof ga === 'function') {
                    ga('send', 'pageview', {
                      'title': window.location.hash.replace('#', '')
                    });
                }

                var sectionId = setNavigationFromHash(window.location.hash);
                sizeSection(sectionId);
            });

            observeEvent(window, 'resize', function() {
                resizeSection();
            });

            monitorContactForm();

            var sectionId = setNavigationFromHash(window.location.hash);
            sizeSection(sectionId);
        };

    init();
})(window, document);