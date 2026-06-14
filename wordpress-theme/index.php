<?php
/**
 * The main template file for Dainik Jahan Guardian Replica.
 */

get_header(); ?>

<main id="primary" class="site-main max-w-7xl mx-auto px-4 py-8">
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 font-serif">
		
		<!-- Main Content Loop -->
		<div class="lg:col-span-8 space-y-12">
			<?php if ( have_posts() ) : ?>
				<?php while ( have_posts() ) : the_post(); ?>
					<article id="post-<?php the_ID(); ?>" <?php post_class('border-b border-gray-150 pb-8 last:border-0'); ?>>
						<header class="entry-header mb-4">
							<span class="text-xs font-bold text-red-600 uppercase tracking-widest font-sans mb-2 block">
								<?php the_category(', '); ?>
							</span>
							<?php the_title( '<h2 class="entry-title text-3xl font-black tracking-tight leading-tight mb-2"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark" class="hover:text-blue-900">', '</a></h2>' ); ?>
							
							<div class="entry-meta text-xs text-gray-500 font-sans font-bold flex gap-4">
								<span class="byline">By <?php the_author(); ?></span>
								<span class="posted-on"><?php echo get_the_date(); ?></span>
							</div>
						</header>

						<?php if ( has_post_thumbnail() ) : ?>
							<div class="post-thumbnail aspect-video overflow-hidden rounded shadow-sm mb-4">
								<?php the_post_thumbnail('large', array('class' => 'w-full h-full object-cover')); ?>
							</div>
						<?php endif; ?>

						<div class="entry-content leading-relaxed text-gray-800 text-lg space-y-4">
							<?php the_excerpt(); ?>
						</div>
					</article>
				<?php endwhile; ?>
			<?php else : ?>
				<p class="italic text-gray-500">No posts found on this feed.</p>
			<?php endif; ?>
		</div>

		<!-- Widget Sidebar -->
		<aside class="lg:col-span-4 pl-6 border-l border-gray-100">
			<?php get_sidebar(); ?>
		</aside>

	</div>
</main>

<?php get_footer(); ?>
