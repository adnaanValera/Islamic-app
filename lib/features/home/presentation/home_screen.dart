import 'package:flutter/material.dart';
import 'package:islamic_app/features/home/domain/home_feature_catalog.dart';
import 'package:islamic_app/features/home/presentation/widgets/feature_card.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar.large(
            title: const Text('Assalamu alaikum'),
            actions: [
              IconButton(
                tooltip: 'Settings',
                onPressed: () {},
                icon: const Icon(Icons.settings_outlined),
              ),
              const SizedBox(width: 8),
            ],
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
            sliver: SliverToBoxAdapter(
              child: _WelcomePanel(theme: theme),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
            sliver: SliverToBoxAdapter(
              child: Text('Explore', style: theme.textTheme.headlineSmall),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
            sliver: SliverLayoutBuilder(
              builder: (context, constraints) {
                final columns = constraints.crossAxisExtent >= 700 ? 3 : 2;
                return SliverGrid.builder(
                  itemCount: HomeFeatureCatalog.features.length,
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: columns,
                    mainAxisSpacing: 8,
                    crossAxisSpacing: 8,
                    childAspectRatio: columns == 2 ? 0.92 : 1.25,
                  ),
                  itemBuilder: (context, index) => FeatureCard(
                    feature: HomeFeatureCatalog.features[index],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _WelcomePanel extends StatelessWidget {
  const _WelcomePanel({required this.theme});

  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    final colors = theme.colorScheme;

    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [colors.primary, colors.tertiary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(28),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.nights_stay_rounded, color: colors.onPrimary, size: 32),
            const SizedBox(height: 32),
            Text(
              'One calm place for your daily worship.',
              style: theme.textTheme.headlineSmall?.copyWith(
                color: colors.onPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Prayer, reflection, and remembrance — thoughtfully connected.',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: colors.onPrimary.withValues(alpha: 0.82),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
