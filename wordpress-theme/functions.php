<?php
/**
 * Dainik Jahan functions and definitions
 */

function dainik_jahan_setup() {
	// Add support for post thumbnails
	add_theme_support( 'post-thumbnails' );

	// Register navigation menu
	register_nav_menus( array(
		'main-menu' => __( 'Main Menu', 'dainik-jahan' ),
	) );
}
add_action( 'after_setup_theme', 'dainik_jahan_setup' );

function dainik_jahan_widgets_init() {
	register_sidebar( array(
		'name'          => __( 'Main Sidebar', 'dainik-jahan' ),
		'id'            => 'main-sidebar',
		'description'   => __( 'Widgets in this area will be shown on all posts and pages.', 'dainik-jahan' ),
		'before_widget' => '<div id="%1$s" class="widget %2$s border border-gray-200 p-6 mb-8">',
		'after_widget'  => '</div>',
		'before_title'  => '<h3 class="text-xs font-black uppercase tracking-widest text-[#052962] mb-4">',
		'after_title'   => '</h3>',
	) );
}
add_action( 'widgets_init', 'dainik_jahan_widgets_init' );
