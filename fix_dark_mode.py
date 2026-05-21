import os
import glob

def replace_in_files(file_paths):
    replacements = [
        (
            'className="bg-white rounded-xl border border-slate-200 overflow-hidden"',
            'className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden"'
        ),
        (
            'className="p-4 sm:p-5 border-b border-slate-200"',
            'className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700/60"'
        ),
        (
            'className="p-4 sm:p-5 border-b border-slate-200 flex',
            'className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700/60 flex'
        ),
        (
            'className="px-4 py-3 sm:px-5 border-t border-slate-200 bg-slate-50',
            'className="px-4 py-3 sm:px-5 border-t border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50'
        ),
        (
            'className="text-base font-semibold text-slate-900"',
            'className="text-base font-semibold text-slate-900 dark:text-white"'
        ),
        (
            'className="text-sm font-medium text-slate-700 mb-1 max-w-[200px]"',
            'className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 max-w-[200px]"'
        ),
        (
            'bg-slate-50 border border-slate-200',
            'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60'
        ),
        (
            'text-sm text-slate-700 bg-white border border-slate-300',
            'text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700'
        )
    ]

    for path in file_paths:
        with open(path, 'r') as f:
            content = f.read()

        changed = False
        for old, new in replacements:
            if old in content:
                content = content.replace(old, new)
                changed = True

        if changed:
            with open(path, 'w') as f:
                f.write(content)
            print(f"Updated {path}")

files = glob.glob('src/pages/**/*.tsx', recursive=True)
replace_in_files(files)
print("Done!")
