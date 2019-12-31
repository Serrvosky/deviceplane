package filtering

import (
	"regexp"
)

var nodePrefixRegex = regexp.MustCompile(`(?m)(^|^# HELP |^# TYPE )(node_)`)

func FilterNodePrefix(rawHostMetrics string) string {
	return replaceAllStringSubmatchFunc(nodePrefixRegex, rawHostMetrics, func(s []string) string {
		return s[1]
	})
}

// Elliot Chance's github gist: https://gist.github.com/elliotchance/d419395aa776d632d897
func replaceAllStringSubmatchFunc(re *regexp.Regexp, str string, repl func([]string) string) string {
	result := ""
	lastIndex := 0

	for _, v := range re.FindAllSubmatchIndex([]byte(str), -1) {
		groups := []string{}
		for i := 0; i < len(v); i += 2 {
			groups = append(groups, str[v[i]:v[i+1]])
		}

		result += str[lastIndex:v[0]] + repl(groups)
		lastIndex = v[1]
	}

	return result + str[lastIndex:]
}
