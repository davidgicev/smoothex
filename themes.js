//ova vo poseben file nekako bi trebalo

var themes = {
	light: {
		name: "light",
		background: "white",
		axes: "black",
		grid: "#d2d2d2",
		font: "gray",
		colors: ["transparent", "#2191FB", "#de214e", "indigo", "green","plum"],
		osEntryBackground: "#fdfdfd",
		osBackground: "#f0f0f0",
		oButtonBackground: "#e6e6e6",
		icon: '<i class="far fa-sun"></i>',
		inputColorIndicator: "#e6e6e6",
		inputBackground: "#f7f7f7"
	},
	dark: {
		name: "dark",
		background: "black",
		axes: "white",
		grid: "#3d3d3d",
		font: "white",
		colors: ["transparent", "#2191FB", "#de214e", "indigo", "green","plum"],
		osEntryBackground: "black",
		osBackground: "#232323",
		oButtonBackground: "#333333",
		icon: '<i class="fas fa-moon"></i>',
		inputColorIndicator: "#333333",
		inputBackground: "#232323"
	}
}

export {themes}