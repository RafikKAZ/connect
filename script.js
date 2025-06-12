document.addEventListener("DOMContentLoaded", function () {
    let map, placemark;

    const cityCenters = {
         "Абай": [49.636944, 72.861944],
        "Абай (Алм.обл.)": [43.238949, 76.779709],
        "Аксай": [51.172778, 52.997222],
        "Актау": [43.65107, 51.1533],
        "Актобе": [50.283937, 57.166978],
        "Алматы": [43.238949, 76.889709],
        "Аса": [43.346944, 72.887778],
        "Астана": [51.169392, 71.449074],
        "Атамекен": [43.3634, 77.0522],
        "Атырау": [47.094495, 51.923771],
        "Балхаш": [46.844658, 75.996928],
        "Баскудук": [43.584, 51.132],
        "Бектобе": [42.992778, 71.528611],
        "Белбулак": [43.365, 76.95],
        "Боралдай": [43.2676, 76.8117],
        "Булакты (Алм.обл.)": [43.1881, 76.7512],
        "Гульдала": [43.2325, 76.7431],
        "Жанаозен": [43.346603, 52.858894],
        "Жезказган": [47.803837, 67.707956],
        "Житикара": [52.183928, 61.189833],
        "Кандыагаш": [48.487661, 57.595688],
        "Караганда": [49.806066, 73.085358],
        "Каскелен": [43.206667, 76.624167],
        "Кокшетау": [53.294822, 69.404787],
        "Конаев": [43.854849, 77.061581],
        "Костанай": [53.219913, 63.62463],
        "Кызылорда": [44.848831, 65.482267],
        "Лисаковск": [52.548712, 62.497317],
        "Мангистау": [44.113571, 51.904396],
        "Отеген Батыр": [43.36247, 77.083091],
        "Павлодар": [52.287054, 76.967928],
        "Петропавловск": [54.877876, 69.140651],
        "Риддер": [50.344848, 83.51265],
        "Рудный": [52.964454, 63.133419],
        "Сатпаев": [47.881482, 67.54007],
        "Семей": [50.411889, 80.227005],
        "Степногорск": [52.341602, 71.885948],
        "Талдыкорган": [45.015245, 78.375034],
        "Тараз": [42.899879, 71.377946],
        "Темиртау": [50.054938, 72.959289],
        "Туздыбастау": [43.244444, 76.733333],
        "Туркестан": [43.297703, 68.269081],
        "Узынагаш": [43.426389, 76.466944],
        "Ульгули(Жамб.обл.)": [43.003611, 71.645833],
        "Уральск": [51.230942, 51.386524],
        "Усть-Каменогорск": [49.948235, 82.615358],
        "Хромтау": [50.251556, 57.422417],
        "Шахтинск": [49.701231, 72.59182],
        "Шу": [43.598233, 73.761292],
        "Шымкент": [42.341731, 69.590099],
        "Щучинск": [52.934115, 70.189818],
        "Экибастуз": [51.723476, 75.322524]
    };

                ymaps.ready(initMap);

    function initMap() {
        const citySelect = document.getElementById("city");
        const defaultCity = citySelect.value;
        const defaultCityCenter = cityCenters[defaultCity];

        if (!defaultCityCenter) {
            console.error("Не удалось найти координаты для города по умолчанию:", defaultCity);
            return;
        }

        map = new ymaps.Map("map", {
            center: defaultCityCenter,
            zoom: 10,
            controls: [] // Убираем стандартные контролы
        });

        map.events.add("click", function (e) {
            const coords = e.get("coords");
            setPlacemarkAndAddress(coords);
        });

        const searchControl = new ymaps.control.SearchControl({
            options: {
                noPlacemark: true,
                boundedBy: [
                    [defaultCityCenter[0] - 0.1, defaultCityCenter[1] - 0.1],
                    [defaultCityCenter[0] + 0.1, defaultCityCenter[1] + 0.1]
                ],
                placeholderContent: 'Поиск дома в выбранном городе'
            }
        });
        map.controls.add(searchControl);

        searchControl.events.add("resultselect", function (e) {
            const index = e.get("index");
            searchControl.getResult(index).then(function (res) {
                const coords = res.geometry.getCoordinates();
                map.setCenter(coords, 16);
                setPlacemarkAndAddress(coords);
            });
        });

        citySelect.addEventListener("change", function () {
            const selectedCity = this.value;
            const selectedCityCenter = cityCenters[selectedCity];
            if (selectedCityCenter) {
                map.setCenter(selectedCityCenter, 10);
                searchControl.options.set('boundedBy', [
                    [selectedCityCenter[0] - 0.1, selectedCityCenter[1] - 0.1],
                    [selectedCityCenter[0] + 0.1, selectedCityCenter[1] + 0.1]
                ]);
            }
        });

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    const userCoords = [position.coords.latitude, position.coords.longitude];
                    map.setCenter(userCoords, 16);
                    setPlacemarkAndAddress(userCoords);
                },
                function (error) {
                    console.warn("Геолокация недоступна:", error.message);
                }
            );
        }

        // === Кастомная кнопка геолокации ===
        const geolocationButton = new ymaps.control.Button({
            data: {
                content: "📍 Моё местоположение",
                title: "Определить текущее местоположение"
            },
            options: {
                layout: 'default#buttonLayoutWithIcon',
                iconStyle: {
                    imageHref: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png', 
                    imageSize: [24, 24],
                    imageOffset: [-12, -12]
                }
            }
        });

        geolocationButton.events.add('click', function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        const userCoords = [position.coords.latitude, position.coords.longitude];
                        map.setCenter(userCoords, 16);
                        setPlacemarkAndAddress(userCoords);
                    },
                    function (error) {
                        alert("Не удалось определить местоположение.");
                        console.warn("Геолокация недоступна:", error.message);
                    }
                );
            } else {
                alert("Геолокация не поддерживается вашим браузером.");
            }
        });

        map.controls.add(geolocationButton);
    }

    function createPlacemark(coords) {
        return new ymaps.Placemark(coords, {}, {
            preset: "islands#redIcon",
            draggable: false
        });
    }

    function setPlacemarkAndAddress(coords) {
        if (placemark) {
            placemark.geometry.setCoordinates(coords);
        } else {
            placemark = createPlacemark(coords);
            map.geoObjects.add(placemark);
        }
        getAddress(coords);
    }

    function getAddress(coords) {
        ymaps.geocode(coords).then(function (res) {
            const firstGeoObject = res.geoObjects.get(0);
            const address = firstGeoObject.getAddressLine();

            document.getElementById("address").value = address;
            document.getElementById("coordinates").value = coords.join(", ");
            const preview = document.getElementById("selected-address");
            const addressRequired = document.getElementById("address-required");

            if (preview) {
                preview.innerText = 'Выбранный адрес: ' + address;
            }

            const confirmation = document.getElementById("confirmation");
            if (confirmation) {
                confirmation.classList.remove("hidden");
                setTimeout(() => confirmation.classList.add("hidden"), 3000);
            }

            addressRequired?.classList.add("hidden");

            const submitBtn = document.querySelector("#submit-form-btn");
            if (submitBtn) {
                submitBtn.disabled = false;
            }
        });
    }

    document.getElementById("submissionForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        const address = document.getElementById("address").value.trim();
        const coordinates = document.getElementById("coordinates").value.trim();
        const submitBtn = document.querySelector("#submit-form-btn");

        if (address === "" || coordinates === "") {
            const addressRequired = document.getElementById("address-required");
            addressRequired?.classList.remove("hidden");
            return;
        }

        const formData = new FormData(event.target);
        if (submitBtn) submitBtn.disabled = true;

        try {
            const response = await fetch("https://script.google.com/macros/s/AKfycbyvGVEFMym5wPSWUHnfhl_KN_oDnhsgvmRGSohGK1CmUF8JeHkNl_Pd8HLuglQSlSpa/exec",  {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const successMessage = document.getElementById("success-message");
                if (successMessage) {
                    successMessage.classList.remove("hidden");
                }
                if (submitBtn) {
                    submitBtn.innerText = "Заявка отправлена";
                }
                resetForm(false);
                return;
            }

            alert("Ошибка при отправке. Пожалуйста, попробуйте позже.");
            if (submitBtn) submitBtn.disabled = false;

        } catch (error) {
            console.error("Ошибка:", error);
            alert("Произошла ошибка при отправке данных.");
            if (submitBtn) submitBtn.disabled = false;
        }
    });

    function resetForm(preserveDisable = true) {
        document.getElementById("submissionForm").reset();
        if (placemark) {
            map.geoObjects.remove(placemark);
            placemark = null;
        }
        const preview = document.getElementById("selected-address");
        if (preview) preview.innerText = 'Адрес не выбран';

        const confirmation = document.getElementById("confirmation");
        if (confirmation) confirmation.classList.add("hidden");

        const addressRequired = document.getElementById("address-required");
        if (addressRequired) addressRequired.classList.add("hidden");

        if (!preserveDisable) {
            const submitBtn = document.querySelector("#submit-form-btn");
            if (submitBtn) {
                submitBtn.disabled = true;
            }
        }
    }

    document.getElementById("name").addEventListener("input", function () {
        this.value = this.value.replace(/[^А-Яа-яЁёӘәӨөҚқҢңҰұҮүҺһІі\s\-]/g, '');
    });

    document.getElementById("phone").addEventListener("input", function () {
        this.value = this.value.replace(/[^\d]/g, '');
    });
});
