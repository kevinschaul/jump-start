def print_eval_results(eval_results, output_file_path=None):
    """
    Given a bag of eval_results, generate metrics per prompt template, print
    them out and optionally save them to a file.
    
    ===== Metrics by Prompt Template =====
    Template ID  Sample Size  Accuracy   Precision  Recall     F1        
    -----------------------------------------------------------------
    Template 1   200          84.00%     81.48%     88.00%     84.62%    
    Template 2   200          83.50%     79.13%     91.00%     84.65%    
    Template 3   200          81.00%     86.90%     73.00%     79.35%    
    """
    # Group results by prompt template
    template_groups = {}
    for r in eval_results:
        template = r.result.prompt_template
        # Convert the dictionary to a tuple of items for hashing
        if isinstance(template, dict):
            template_key = tuple(sorted(template.items()))
        else:
            template_key = str(template)

        if template_key not in template_groups:
            template_groups[template_key] = []

        template_groups[template_key].append(r)

    # Calculate metrics for each group
    metrics = {}
    for template, results in template_groups.items():
        # Calculate true positives, false positives, and false negatives
        true_positives = sum(
            1 for r in results if r.result.prediction and r.result.expected
        )
        false_positives = sum(
            1 for r in results if r.result.prediction and not r.result.expected
        )
        false_negatives = sum(
            1 for r in results if not r.result.prediction and r.result.expected
        )
        total_predictions = len(results)
        correct_predictions = sum(
            1 for r in results if r.result.prediction == r.result.expected
        )

        # Calculate metrics
        accuracy = correct_predictions / total_predictions if total_predictions else 0
        precision = (
            true_positives / (true_positives + false_positives)
            if (true_positives + false_positives)
            else 0
        )
        recall = (
            true_positives / (true_positives + false_negatives)
            if (true_positives + false_negatives)
            else 0
        )
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0

        metrics[template] = {
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "sample_size": total_predictions,
        }

    # Create a mapping of template keys to indices
    template_ids = {
        template_key: f"Template {i}"
        for i, template_key in enumerate(template_groups.keys(), 1)
    }

    # Create the summary table as a string in tabular format
    summary_table = "\n===== Metrics by Prompt Template =====\n"
    summary_table += f"{'Template ID':<12} {'Sample Size':<12} {'Accuracy':<10} {'Precision':<10} {'Recall':<10} {'F1':<10}\n"
    summary_table += "-" * 65 + "\n"

    for template_key, metric in metrics.items():
        template_id = template_ids[template_key]
        summary_table += f"{template_id:<12} {metric['sample_size']:<12d} {metric['accuracy']:<10.2%} {metric['precision']:<10.2%} {metric['recall']:<10.2%} {metric['f1']:<10.2%}\n"

    # Add template details if needed
    template_details = "\n===== Template ID Mapping =====\n"
    for template_key, template_id in template_ids.items():
        if isinstance(template_key, tuple):
            # Convert tuple back to dictionary for display
            template_dict = dict(template_key)
            template_details += f"{template_id}: {template_dict}\n"
        else:
            template_details += f"{template_id}: {template_key}\n"

    # Combine the tables
    full_output = template_details + summary_table

    # Print to console
    print(full_output)

    # Save to file if path is provided
    if output_file_path:
        with open(output_file_path, "w") as f:
            f.write(full_output)
            print(f"Metrics saved to {output_file_path}")
