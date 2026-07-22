import 'package:flutter/material.dart';
import 'package:islamic_app/features/home/domain/home_feature.dart';

class FeaturePlaceholderScreen extends StatelessWidget {
  const FeaturePlaceholderScreen({required this.feature, super.key});

  final HomeFeature feature;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(feature.title)),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  DecoratedBox(
                    decoration: BoxDecoration(
                      color: feature.tint.withValues(alpha: 0.14),
                      shape: BoxShape.circle,
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Icon(feature.icon, color: feature.tint, size: 48),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(feature.title, style: theme.textTheme.headlineSmall),
                  const SizedBox(height: 8),
                  Text(
                    '${feature.description}. This feature will be built in a future milestone.',
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
