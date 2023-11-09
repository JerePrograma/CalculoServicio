document.addEventListener("DOMContentLoaded", function () {
  let horario = document.getElementById("horario").value;
  let fechaInicio = new Date(document.getElementById("fecha").value);

  var calendarEl = document.getElementById("calendar");

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "es",
    dateClick: function (info) {
      var note = prompt("Ingresá una anotación:");

      if (note) {
        var events = calendar.getEvents().filter(function (e) {
          return e.startStr === info.dateStr;
        });

        var noteEvent = events.find(function (e) {
          return e.title === "Nota";
        });

        if (noteEvent) {
          var existingDescription = noteEvent.extendedProps.description || "";
          var newDescription =
            existingDescription + (existingDescription ? "\n" : "") + note;
          noteEvent.setExtendedProp("description", newDescription);
        } else {
          calendar.addEvent({
            title: "Nota",
            start: info.dateStr,
            allDay: true,
            description: note,
          });
        }
      }
    },
    eventContent: function (arg) {
      var contentEl = document.createElement("div");
      contentEl.classList.add("event-content");

      var titleEl = document.createElement("div");
      titleEl.classList.add("event-title");
      if (arg.event.title !== "Nota") {
        titleEl.textContent = arg.event.title;
        contentEl.appendChild(titleEl);
      }

      if (arg.event.extendedProps.description) {
        var description = arg.event.extendedProps.description;
        var notes = description.split("\n");

        for (var i = 0; i < notes.length; i++) {
          var noteEl = document.createElement("div");
          noteEl.classList.add("event-note");
          noteEl.textContent = notes[i];
          contentEl.appendChild(noteEl);
        }
      }

      return { domNodes: [contentEl] };
    },
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
    let containerWidth = calendarContainer.offsetWidth;

    // Ajusta el ancho para la captura, si es necesario
    calendarContainer.style.width = "100%";

    html2canvas(calendarContainer, {
      scale: 1, // Ajusta este valor si es necesario
      width: containerWidth, // Asegúrate de que estas dimensiones coincidan con el contenedor del calendario
      height: calendarContainer.scrollHeight,
    }).then(function (canvas) {
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
