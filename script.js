$(document).ready(function () {
  function newitem(id, text, state, important) {
    let statestyle = {
      todo: "",
      progress: "",
      completed: "opacity-60%",
    };

    let satteButton = {
      todo: "Add to Progress",
      progress: "Add to Completed",
      completed: "Back to Completed",
    };

    let item = `
	<div class="item ${statestyle[state]} ${
      important == 1 ? "important" : ""
    }" id="${id}" ">
	<i class="fa-${
    state === "todo" ? "regular" : "solid"
  } fa-circle-check circle"></i>
	<input type="text" value="${text}"  readonly class="form-control updating item-content ${
      state === "completed" ? "text-decoration-line-through" : " "
    }">

	<i class="fa-${important == 1 ? "solid" : "regular"} fa-star"></i>

	<div class="dropdown open">
		<button
			class="btn dropdown-toggle"
			type="button"
			id="triggerId"
			data-bs-toggle="dropdown"
			aria-haspopup="true"
			aria-expanded="false"
		>
		<i class="fa-solid fa-ellipsis"></i>
		</button>
		<div class="dropdown-menu" aria-labelledby="triggerId">
			<button class="dropdown-item" href="#">Edit task</button>
			<button class="dropdown-item" href="#">${satteButton[state]}</button>
			<button class="dropdown-item" href="#">Remove Impotence</button>
			<button class="dropdown-item text-danger delete-btn" data-id="${id}">Delete item </button>
		</div>
	</div>
</div>
`;

    return item;
  }


  $(".submitbtn").click(function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    let value = $(".adder").val().trim();

    if (value) {
      addNewItem(value);
      $(".adder").val(""); // Clear the input field
    }
  });

  function addNewItem(value, state = "todo", important = 0) {
    $.ajax({
      url: "ajax/additem.php",
      type: "POST",
      data: {
        text: value,
        state: state,
        important: important,
      },
      success: function (response) {
        // Handle successful insertion (e.g., update UI, display a success message)
        let data = JSON.parse(response);
        console.log("Item added successfully:", data); // For logging (optional)
        addItemToAppropriateDive(data.id, value, state, important);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // Handle errors (e.g., display an error message, log details)
        console.error("Error adding item:", textStatus, errorThrown);
      },
    });
  }


  //todo object is coming from bck and i ma storing in the index.html file 
  // for inserting data to the document  when first user comes to the website
  todos.forEach((todo) => {
    addItemToAppropriateDive(todo[0], todo[1], todo[2], todo[3]);
  });



  //updating the text
  // $(".item-content.updating").focus(function () {
  //   if (!$(this).closest(".item").hasClass("opacity-50")) {
  //     $(this).prop("readonly", !$(this).prop("readonly")); 
  //   }
  // });

  $(".item-content.updating").on({
    focus: function() {
      $(this).toggleattr("readonly", false)
    }
  })




  function addItemToAppropriateDive(id, text, state, important) {
    let item = newitem(id, text, state, important);

    switch (state) {
      case "todo":
        important == 0
          ? $(".todo").append(item)
          : $(".todo .card-heading").after(item);
        break;
      case "progress":
        important == 0
          ? $("#progress").append(item)
          : $(".progress .card-heading").after(item);
        break;
      case "completed":
        important == 0
          ? $(".completed").append(item)
          : $(".completed .card-heading").after(item);
        break;
      default:
        console.warn("Invalid state:", state); 
        break;
    }
  }


    //delete feature
    $(document).on("click", ".delete-btn", function () {
      let id = $(this).data("id");
  
      $.ajax({
        url: "ajax/deleteitem.php",
        type: "POST",
        data: {
          id: id,
        },
        success: function (response) {
          // Successful deletion - remove item from DOM
          $(`#${id}`).fadeOut(function () {
            $(this).remove(); // Remove the element after fade-out
            console.log("Item deleted successfully:", response);
            console.log("this item:", $(this));
          });
        },
        error: function (jqXHR, textStatus, errorThrown) {
          // Handle general AJAX request errors
          console.error("AJAX Error:", textStatus, errorThrown);
        },
      });
    });

  //circle icone
  $(".item .circle").click(function () {
    let id = $(this).closest(".item").attr("id");
    let parent = $(this).closest(".item").closest(".drag");
    let state;

    if (parent.attr("id") === "todo") {
      $(this).toggleClass("fa-regular fa-solid");

      $(this).closest(".item").detach();
      $(this).closest(".item").appendTo("#progress");

      state = "progress";
    } else {
      $(this).toggleClass("fa-regular fa-solid");

      $(this).closest(".item").detach();
      $(this).closest(".item").appendTo("#todo");

      state = "todo";
    }

    let arguments = {
      id: id,
      state: state,
    };
    update(arguments);
  });

  function update({ id, text, state, important }) {
    $.ajax({
      url: "ajax/update.php",
      type: "POST",
      data: {
        id: id,
        text: text,
        state: state,
        important: important,
      },
      success: function (response) {
        console.log("updated sucsasfully", response);
        return true;
      },
      error: function (textStatus, errorThrown) {
        consoloe.warn("AJAX Error:", textStatus, errorThrown);
        return false;
      },
    });
  }

  //the stare icone and updating the importance
  $(".item .fa-star").click(function () {
    var item = $(this).closest(".item");
    var currentContainer = $(this).closest(".drag");
    var state = currentContainer.attr("id");

    // Toggle star icon classes (optional, adjust as needed)
    $(this).toggleClass("fa-regular fa-solid");

    // Toggle important value
    var isImportant = item.hasClass("important");

    if (!isImportant) {
      item.detach();
      $(`#${state} .card-heading`).after(item);
    }

    item.toggleClass("important", !isImportant); // Add or remove "important" class
    let arguments = {
      id: item.attr("id"),
      state: state,
      important: item.hasClass("important") ? 1 : 0, // Send updated importance value
    };
    update(arguments);
  });

  //drag $ drop feature
  $("#todo, #progress, #completed").sortable({
    connectWith: ".drag",
    cursor: "grab",
    update: function (event, ui) {
      let item = ui.item;
      let id = item.attr("id");

      let state = item.closest(".drag").attr("id");

      let stareicon = $(`#${id} .circle`);

      if (state == "todo") {
        stareicon.addClass("fa-regular");
        stareicon.removeClass("fa-solid");
        $(`#${id} .updating`).removeClass("text-decoration-line-through");

      } else if (state == "progress") {
        stareicon.addClass("fa-solid");
        stareicon.removeClass("fa-regular");
        $(`#${id} .updating`).removeClass("text-decoration-line-through");

      } else if (state == "completed") {
        stareicon.addClass("fa-solid");
        stareicon.removeClass("fa-regular");
        $(`#${id} .updating`).addClass("text-decoration-line-through");

      }

      let arguments = {
        id: id,
        state: state,
      };
      update(arguments);
    },
  });


  $("#theme-toggle").click(function() {
    // Toggle body class for dark theme
    $("body").toggleClass("dark");

    // Update button text and style based on current theme
    if ($("body").hasClass("dark")) {
      $(this).text("Light Theme").addClass("dark"); // Change text and style for dark theme
    } else {
      $(this).text("Dark Theme").removeClass("dark"); // Change text and style for light theme
    }
  });




});
