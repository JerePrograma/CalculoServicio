document.addEventListener("DOMContentLoaded", function () {
  var calendarEl = document.getElementById("calendar");

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "es",
  });

  calendar.render();

  document.getElementById("calcular").addEventListener("click", function () {
    let horario = document.getElementById("horario").value;
    let fechaInicio = new Date(document.getElementById("fecha").value);

    fechaInicio.setUTCHours(0, 0, 0, 0);

    calendar.getEvents().forEach(function (event) {
      event.remove();
    });

    let incremento;
    if (horario === "12x36") {
      incremento = 2;
    } else if (horario === "24x48") {
      incremento = 3;
    }

    let fechaActual = new Date(fechaInicio);
    let finalYear = new Date(fechaInicio.getUTCFullYear(), 11, 31);

    while (fechaActual <= finalYear) {
      let fechaString = formatDate(fechaActual);
      calendar.addEvent({
        title: "Servicio",
        start: fechaString,
        allDay: true,
      });

      fechaActual.setUTCDate(fechaActual.getUTCDate() + incremento);
    }

    calendar.gotoDate(formatDate(fechaInicio));
  });

  function formatDate(date) {
    var d = new Date(date),
      month = "" + (d.getUTCMonth() + 1),
      day = "" + d.getUTCDate(),
      year = d.getUTCFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }
});

function copyToClipboard(inputId) {
  var copyText = document.getElementById(inputId);

  copyText.select();
  copyText.setSelectionRange(0, 99999); 

  document.execCommand("copy");

  alert("Copiado: " + copyText.value);
}
