document.addEventListener("DOMContentLoaded", function () {
  let horario = document.getElementById("horario").value;
  let fechaInicio = new Date(document.getElementById("fecha").value);

  var calendarEl = document.getElementById("calendar");

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "es",
  });

  calendar.render();

  document.getElementById("calcular").addEventListener("click", function () {
    let horario = document.getElementById("horario").value;
    let fechaInicio = new Date(document.getElementById("fecha").value);
    if (horario === "" || isNaN(fechaInicio)) {
      alert(
        "Por favor, seleccioná un horario y una fecha antes de calcular las fechas."
      );
      return;
    }
    fechaInicio.setUTCHours(0, 0, 0, 0);

    calendar.getEvents().forEach(function (event) {
      event.remove();
    });

    let incremento;
    if (horario === "12x36") {
      incremento = 2;
    } else if (horario === "24x48") {
      incremento = 3;
    } else if (horario === "48x96") {
      incremento = 6;
    }

    let fechaActual = new Date(fechaInicio);
    let finalYear = new Date(fechaInicio.getUTCFullYear(), 11, 31);

    while (fechaActual <= finalYear) {
      if (horario === "48x96") {
        for (let i = 0; i < 2; i++) {
          // Añadir 2 días de trabajo
          let fechaString = formatDate(new Date(fechaActual));
          calendar.addEvent({
            title: "Servicio",
            start: fechaString,
            allDay: true,
          });
          fechaActual.setUTCDate(fechaActual.getUTCDate() + 1);
        }
        fechaActual.setUTCDate(fechaActual.getUTCDate() + 4); // Añadir 4 días de descanso
      } else {
        let fechaString = formatDate(fechaActual);
        calendar.addEvent({
          title: "Servicio",
          start: fechaString,
          allDay: true,
        });
        fechaActual.setUTCDate(fechaActual.getUTCDate() + incremento);
      }
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

  document.getElementById("generatePDF").addEventListener("click", function () {
    let calendarContainer = document.querySelector("#calendar");

    // Aumentar el tamaño del contenedor del calendario
    calendarContainer.style.width = "80%";

    // Ajustar la escala de la página para incluir todo el calendario en la captura de pantalla
    document.body.style.zoom = "80%";

    html2canvas(calendarContainer).then(function (canvas) {
      var imgData = canvas.toDataURL("image/png");

      // Crear una nueva instancia de jsPDF en orientación horizontal
      let doc = new jsPDF("landscape");

      // Ajustar la escala de la imagen para que se ajuste al PDF
      var width = doc.internal.pageSize.getWidth();
      var height = doc.internal.pageSize.getHeight();
      doc.addImage(imgData, "PNG", 0, 0, width, height);

      doc.save("Servicios_mes.pdf");

      // Restaurar el tamaño original del contenedor del calendario y la escala de la página
      calendarContainer.style.width = "100%";
      document.body.style.zoom = "100%";
    });
  });
});
